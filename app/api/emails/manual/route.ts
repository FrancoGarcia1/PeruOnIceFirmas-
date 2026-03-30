import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { email, name, dni } = await req.json();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("contract_emails")
    .insert({
      email: email.trim().toLowerCase(),
      manual_name: name?.trim() || null,
      manual_dni: dni?.trim() || null,
    });

  if (error) {
    return NextResponse.json({ error: "Error al agregar: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
