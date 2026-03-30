import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import nodemailer from "nodemailer";
import { generateEmailHtml, type TemplateFields } from "@/lib/email-templates";

const GMAIL_USER = process.env.GMAIL_USER ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";
const BATCH_SIZE = 10;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Extraer primer nombre de "APELLIDO APELLIDO, NOMBRE SEGUNDO" → "Nombre"
function extractFirstName(fullName: string): string {
  const parts = fullName.split(",");
  const firstName = (parts[1] ?? parts[0] ?? "").trim().split(" ")[0] ?? "";
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { subject, body, templateFields, selectedIds } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Asunto y mensaje son obligatorios" }, { status: 400 });
  }

  // Obtener destinatarios: seleccionados o todos
  let query = supabase
    .from("contract_emails")
    .select("id, email, contract_id, manual_name, contracts(adult_name)");

  if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
    query = query.in("id", selectedIds);
  }

  const { data: emailRows } = await query;

  if (!emailRows || emailRows.length === 0) {
    return NextResponse.json({ error: "No hay correos para enviar" }, { status: 400 });
  }

  // Deduplicar por email y extraer nombre
  const recipientMap = new Map<string, string>();
  for (const row of emailRows) {
    if (recipientMap.has(row.email)) continue;
    const contract = row.contracts as unknown as { adult_name: string } | null;
    const name = row.manual_name ?? contract?.adult_name ?? "";
    recipientMap.set(row.email, name);
  }

  const recipients = Array.from(recipientMap.entries()).map(([email, name]) => ({
    email,
    firstName: name ? extractFirstName(name) : "",
  }));

  // Crear registro de campaña
  const { data: campaign } = await supabase
    .from("email_campaigns")
    .insert({
      subject: subject.trim(),
      body: body.trim(),
      total_recipients: recipients.length,
      status: "sending",
      created_by: user.id,
    })
    .select("id")
    .single();

  // Generar HTML base
  const baseHtml = templateFields
    ? generateEmailHtml(templateFields as TemplateFields)
    : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #B22234;">Perú on Ice</h2>
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          ${body.trim().split("\n").map((l: string) => `<p style="color: #374151; line-height: 1.6; margin: 0 0 12px;">${l}</p>`).join("")}
        </div>
      </div>`;

  let sent = 0;
  let failed = 0;

  // Enviar en batches con personalización
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(({ email, firstName }) => {
      // Reemplazar {{nombre}} con el primer nombre del destinatario
      const personalizedHtml = baseHtml.replace(/\{\{nombre\}\}/gi, firstName || "");
      const personalizedSubject = subject.trim().replace(/\{\{nombre\}\}/gi, firstName || "");

      return transporter
        .sendMail({
          from: `Perú on Ice <${GMAIL_USER}>`,
          to: email,
          subject: personalizedSubject,
          html: personalizedHtml,
        })
        .then(() => { sent++; })
        .catch(() => { failed++; });
    });

    await Promise.all(batchPromises);
  }

  if (campaign?.id) {
    await supabase
      .from("email_campaigns")
      .update({
        sent_count: sent,
        failed_count: failed,
        status: failed === recipients.length ? "failed" : "completed",
      })
      .eq("id", campaign.id);
  }

  return NextResponse.json({ sent, failed, total: recipients.length });
}
