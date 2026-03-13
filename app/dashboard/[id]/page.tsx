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

  let signaturePublicUrl: string | null = null;
  if (contract.signature_url) {
    const { data } = supabase.storage
      .from("signatures")
      .getPublicUrl(contract.signature_url);
    signaturePublicUrl = data.publicUrl;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-burgundy hover:text-burgundy-dark font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>
        <div className="hidden sm:block w-px h-6 bg-ice-dark" />
        <h2 className="text-xl md:text-2xl font-bold text-dark">
          Detalle del contrato
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos del contrato */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-burgundy to-burgundy-light" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-5">
              Adulto responsable
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-[10px] font-semibold text-dark-soft/50 uppercase tracking-wider">
                  Nombre
                </dt>
                <dd className="text-dark font-semibold text-lg mt-0.5">
                  {contract.adult_name}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold text-dark-soft/50 uppercase tracking-wider">
                  DNI
                </dt>
                <dd className="text-dark font-mono text-base mt-0.5">
                  {contract.adult_dni}
                </dd>
              </div>
              {contract.adult_age && (
                <div>
                  <dt className="text-[10px] font-semibold text-dark-soft/50 uppercase tracking-wider">
                    Edad
                  </dt>
                  <dd className="text-dark mt-0.5">
                    {contract.adult_age} años
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-semibold text-dark-soft/50 uppercase tracking-wider">
                  Fecha de firma
                </dt>
                <dd className="text-dark mt-0.5">
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
              <div className="mt-8">
                <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-4">
                  Menores registrados
                </h3>
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
                        className="bg-frost rounded-xl p-4 border border-ice-dark/30"
                      >
                        <p className="font-semibold text-dark">
                          {minor.minor_name}
                        </p>
                        <p className="text-sm text-dark-soft/60 mt-0.5">
                          {minor.minor_dni && (
                            <span className="font-mono">
                              DNI: {minor.minor_dni} &middot;{" "}
                            </span>
                          )}
                          Edad: {minor.minor_age} años
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-8">
              <a
                href={`/api/pdf/${contract.id}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-burgundy text-white rounded-xl hover:bg-burgundy-dark transition-all text-sm font-bold shadow-lg shadow-burgundy/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar PDF
              </a>
            </div>
          </div>
        </div>

        {/* Firma */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-ice-dark to-ice" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-5">
              Firma digital
            </h3>
            {signaturePublicUrl ? (
              <div className="border-2 border-ice-dark/40 rounded-xl p-6 bg-white">
                <img
                  src={signaturePublicUrl}
                  alt="Firma del contrato"
                  className="max-w-full h-auto mx-auto"
                />
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ice-dark/30">
                  <div className="flex-1 h-px bg-ice-dark/40" />
                  <span className="text-[10px] text-dark-soft/40 uppercase tracking-wider font-semibold">
                    Firma del responsable
                  </span>
                  <div className="flex-1 h-px bg-ice-dark/40" />
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-dark-soft/30">
                <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                <p className="text-sm font-medium">Firma no disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
