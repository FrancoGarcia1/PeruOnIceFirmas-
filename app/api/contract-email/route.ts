import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contractId, email } = body;

  if (!contractId || !email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Verificar que el contrato existe
  const { data: contract } = await supabase
    .from("contracts")
    .select("id")
    .eq("id", contractId)
    .single();

  if (!contract) {
    return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  }

  // Upsert: si ya existe email para este contrato, actualizar
  const { error } = await supabase
    .from("contract_emails")
    .upsert(
      { contract_id: contractId, email: email.trim().toLowerCase() },
      { onConflict: "contract_id" }
    );

  if (error) {
    return NextResponse.json({ error: "Error al guardar el correo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
