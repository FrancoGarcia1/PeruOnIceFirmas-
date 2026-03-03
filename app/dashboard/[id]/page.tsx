import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*, minors(*)")
    .eq("id", id)
    .single();

  if (!contract) notFound();

  // Get signature URL
  let signaturePublicUrl: string | null = null;
  if (contract.signature_url) {
    const { data } = supabase.storage
      .from("signatures")
      .getPublicUrl(contract.signature_url);
    signaturePublicUrl = data.publicUrl;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          &larr; Volver
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          Detalle del contrato
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos del contrato */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Adulto responsable
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 uppercase">Nombre</dt>
              <dd className="text-gray-900 font-medium">
                {contract.adult_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase">DNI</dt>
              <dd className="text-gray-900">{contract.adult_dni}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase">
                Fecha de firma
              </dt>
              <dd className="text-gray-900">
                {new Date(contract.signed_at).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>

          {/* Menores */}
          {contract.minors && contract.minors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Menores</h3>
              <div className="space-y-3">
                {contract.minors.map(
                  (minor: {
                    id: string;
                    minor_name: string;
                    minor_dni: string | null;
                    minor_age: number;
                  }) => (
                    <div
                      key={minor.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <p className="font-medium text-gray-900">
                        {minor.minor_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {minor.minor_dni && `DNI: ${minor.minor_dni} · `}
                        Edad: {minor.minor_age} años
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <a
              href={`/api/pdf/${contract.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Descargar PDF
            </a>
          </div>
        </div>

        {/* Firma */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Firma</h3>
          {signaturePublicUrl ? (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={signaturePublicUrl}
                alt="Firma del contrato"
                className="max-w-full h-auto"
              />
            </div>
          ) : (
            <p className="text-gray-400">Firma no disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}
