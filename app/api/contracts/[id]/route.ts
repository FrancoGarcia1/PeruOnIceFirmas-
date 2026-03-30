import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Soft delete: mover a papelera en vez de eliminar permanentemente
  const { error } = await supabase
    .from("contracts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Borrado permanente (desde papelera)
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Solo permitir borrado permanente de contratos en papelera
  const { data: contract } = await supabase
    .from("contracts")
    .select("signature_url, deleted_at")
    .eq("id", id)
    .single();

  if (!contract?.deleted_at) {
    return NextResponse.json({ error: "Solo se pueden eliminar contratos en papelera" }, { status: 400 });
  }

  // Eliminar firma del storage
  if (contract.signature_url) {
    await supabase.storage.from("signatures").remove([contract.signature_url]);
  }

  // Eliminar menores
  await supabase.from("minors").delete().eq("contract_id", id);

  // Eliminar email asociado
  await supabase.from("contract_emails").delete().eq("contract_id", id);

  // Eliminar contrato
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Restaurar contrato de la papelera
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await supabase
    .from("contracts")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
