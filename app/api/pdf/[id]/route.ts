import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createSupabaseServer } from "@/lib/supabase-server";
import ContractPDF from "@/components/ContractPDF";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*, minors(*)")
    .eq("id", id)
    .single();

  if (!contract) {
    return new Response("Contrato no encontrado", { status: 404 });
  }

  // Get signature image
  let signatureBase64: string | null = null;
  if (contract.signature_url) {
    const { data } = await supabase.storage
      .from("signatures")
      .download(contract.signature_url);

    if (data) {
      const buffer = await data.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      signatureBase64 = `data:image/png;base64,${base64}`;
    }
  }

  const buffer = await renderToBuffer(
    ContractPDF({
      adultName: contract.adult_name,
      adultDni: contract.adult_dni,
      signedAt: contract.signed_at,
      signatureBase64,
      minors: contract.minors ?? [],
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${contract.adult_dni}.pdf"`,
    },
  });
}
