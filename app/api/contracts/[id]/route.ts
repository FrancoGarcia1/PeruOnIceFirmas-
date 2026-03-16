import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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

  // Obtener la URL de la firma para eliminarla del storage
  const { data: contract } = await supabase
    .from("contracts")
    .select("signature_url")
    .eq("id", id)
    .single();

  if (contract?.signature_url) {
    await supabase.storage.from("signatures").remove([contract.signature_url]);
  }

  // Eliminar menores asociados
  await supabase.from("minors").delete().eq("contract_id", id);

  // Eliminar contrato
  const { error } = await supabase.from("contracts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
