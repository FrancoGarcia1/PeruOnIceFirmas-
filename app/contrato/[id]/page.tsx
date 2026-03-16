import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PublicContractPage({
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

  const formattedDate = new Date(contract.signed_at).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-frost">
      {/* Header con branding */}
      <div className="bg-dark px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-1.5 shrink-0">
            <Image
              src="/logo.png"
              alt="Perú on Ice"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">
              Perú on Ice
            </h1>
            <p className="text-white/50 text-xs mt-0.5">
              Contrato de responsabilidad
            </p>
          </div>
        </div>
      </div>

      {/* Banda decorativa */}
      <div className="h-1.5 bg-gradient-to-r from-burgundy via-burgundy-light to-burgundy" />

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* Card principal */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy to-burgundy-light" />
          <div className="p-5 md:p-6">
            <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-4">
              Adulto responsable
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-baseline gap-4">
                <dt className="text-[11px] font-semibold text-dark-soft/50 uppercase tracking-wider shrink-0">Nombre</dt>
                <dd className="text-dark font-bold text-right">{contract.adult_name}</dd>
              </div>
              <div className="flex justify-between items-baseline gap-4">
                <dt className="text-[11px] font-semibold text-dark-soft/50 uppercase tracking-wider shrink-0">DNI</dt>
                <dd className="text-dark font-mono">{contract.adult_dni}</dd>
              </div>
              {contract.adult_age && (
                <div className="flex justify-between items-baseline gap-4">
                  <dt className="text-[11px] font-semibold text-dark-soft/50 uppercase tracking-wider shrink-0">Edad</dt>
                  <dd className="text-dark">{contract.adult_age} años</dd>
                </div>
              )}
              <div className="flex justify-between items-baseline gap-4">
                <dt className="text-[11px] font-semibold text-dark-soft/50 uppercase tracking-wider shrink-0">Fecha</dt>
                <dd className="text-dark text-right text-sm">{formattedDate}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Menores */}
        {contract.minors && contract.minors.length > 0 && (
          <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-ice-dark to-ice" />
            <div className="p-5 md:p-6">
              <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-4">
                Menores registrados
              </h2>
              <div className="space-y-3">
                {contract.minors.map(
                  (minor: { id: string; minor_name: string; minor_dni: string | null; minor_age: number }) => (
                    <div key={minor.id} className="bg-frost rounded-xl p-3.5 border border-ice-dark/30">
                      <p className="font-semibold text-dark text-sm">{minor.minor_name}</p>
                      <p className="text-xs text-dark-soft/60 mt-0.5">
                        {minor.minor_dni && (
                          <span className="font-mono">DNI: {minor.minor_dni} · </span>
                        )}
                        {minor.minor_age} años
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Firma */}
        {signaturePublicUrl && (
          <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-4">
                Firma digital
              </h2>
              <div className="border-2 border-ice-dark/30 rounded-xl p-4 bg-frost">
                <img
                  src={signaturePublicUrl}
                  alt="Firma"
                  className="max-w-full h-auto mx-auto max-h-32"
                />
                <p className="text-center text-[10px] text-dark-soft/40 uppercase tracking-wider font-semibold mt-3">
                  Firma del responsable
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón descargar PDF */}
        <a
          href={`/api/pdf/${contract.id}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-sm shadow-lg shadow-burgundy/25 hover:bg-burgundy-dark transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar mi contrato en PDF
        </a>

        <p className="text-center text-xs text-dark-soft/40 pb-4">
          Perú on Ice S.A.C. · Documento generado digitalmente
        </p>
      </div>
    </div>
  );
}
