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

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { subject, body, templateFields } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Asunto y mensaje son obligatorios" }, { status: 400 });
  }

  // Generar HTML con plantilla si viene, sino fallback básico
  const emailHtml = templateFields
    ? generateEmailHtml(templateFields as TemplateFields)
    : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #B22234;">Perú on Ice</h2>
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          ${body.trim().split("\n").map((l: string) => `<p style="color: #374151; line-height: 1.6; margin: 0 0 12px;">${l}</p>`).join("")}
        </div>
      </div>`;

  // Obtener correos únicos
  const { data: emailRows } = await supabase
    .from("contract_emails")
    .select("email");

  if (!emailRows || emailRows.length === 0) {
    return NextResponse.json({ error: "No hay correos para enviar" }, { status: 400 });
  }

  const uniqueEmails = [...new Set(emailRows.map((r) => r.email))];

  // Crear registro de campaña
  const { data: campaign } = await supabase
    .from("email_campaigns")
    .insert({
      subject: subject.trim(),
      body: body.trim(),
      total_recipients: uniqueEmails.length,
      status: "sending",
      created_by: user.id,
    })
    .select("id")
    .single();

  let sent = 0;
  let failed = 0;

  // Enviar en batches
  for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
    const batch = uniqueEmails.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map((email) =>
      transporter
        .sendMail({
          from: `Perú on Ice <${GMAIL_USER}>`,
          to: email,
          subject: subject.trim(),
          html: emailHtml,
        })
        .then(() => { sent++; })
        .catch(() => { failed++; })
    );

    await Promise.all(batchPromises);
  }

  // Actualizar campaña
  if (campaign?.id) {
    await supabase
      .from("email_campaigns")
      .update({
        sent_count: sent,
        failed_count: failed,
        status: failed === uniqueEmails.length ? "failed" : "completed",
      })
      .eq("id", campaign.id);
  }

  return NextResponse.json({ sent, failed, total: uniqueEmails.length });
}
