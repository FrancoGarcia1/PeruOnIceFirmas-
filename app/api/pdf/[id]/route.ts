import { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function runPdfScript(jsonData: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(process.cwd(), "lib", "generate-pdf.mjs");
    const child = spawn("node", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));

    child.on("close", (code) => {
      if (code !== 0) {
        const errMsg = Buffer.concat(errChunks).toString();
        return reject(new Error(`PDF process exited ${code}: ${errMsg}`));
      }
      resolve(Buffer.concat(chunks));
    });

    child.stdin.write(jsonData);
    child.stdin.end();
  });
}

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

  let signatureBase64: string | null = null;
  if (contract.signature_url) {
    const { data } = await supabase.storage
      .from("signatures")
      .download(contract.signature_url);

    if (data) {
      const arrayBuffer = await data.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      signatureBase64 = `data:image/png;base64,${base64}`;
    }
  }

  const pdfData = JSON.stringify({
    adultName: contract.adult_name,
    adultDni: contract.adult_dni,
    signedAt: contract.signed_at,
    signatureBase64,
    minors: (contract.minors ?? []).map((m: { minor_name: string; minor_dni: string | null; minor_age: number }) => ({
      minor_name: m.minor_name,
      minor_dni: m.minor_dni,
      minor_age: m.minor_age,
    })),
  });

  try {
    const pdfBuffer = await runPdfScript(pdfData);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.adult_dni}.pdf"`,
      },
    });
  } catch (err) {
    return new Response(`Error generando PDF: ${err}`, { status: 500 });
  }
}
