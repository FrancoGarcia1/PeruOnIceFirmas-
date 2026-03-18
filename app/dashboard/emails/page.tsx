import { createSupabaseServer } from "@/lib/supabase-server";
import EmailTable from "@/components/EmailTable";

const PAGE_SIZE = 20;

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const search = params.q?.trim() ?? "";
  const supabase = await createSupabaseServer();

  // Query con join a contracts para nombre y DNI
  let query = supabase
    .from("contract_emails")
    .select("id, email, created_at, contract_id, contracts(adult_name, adult_dni)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,contracts.adult_name.ilike.%${search}%`
    );
  }

  const { data: emails, count } = await query
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // Stats
  const { count: totalEmails } = await supabase
    .from("contract_emails")
    .select("*", { count: "exact", head: true });

  // Correos únicos
  const { data: uniqueData } = await supabase
    .from("contract_emails")
    .select("email");
  const uniqueCount = new Set(uniqueData?.map((e) => e.email) ?? []).size;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark">Correos</h2>
          <p className="text-sm text-dark-soft/50 mt-1">
            Correos recopilados de clientes que descargaron su contrato
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/emails/export"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-ice-dark/40 text-dark-soft rounded-xl hover:bg-frost transition-all text-sm font-bold"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </a>
          <a
            href="/dashboard/emails/compose"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white rounded-xl hover:bg-burgundy-dark transition-all text-sm font-bold shadow-lg shadow-burgundy/20"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Enviar correo masivo
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-ice-dark/40 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Total correos</p>
          <p className="text-2xl font-bold text-dark mt-1">{totalEmails ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-ice-dark/40 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Correos únicos</p>
          <p className="text-2xl font-bold text-dark mt-1">{uniqueCount}</p>
        </div>
      </div>

      <EmailTable
        emails={emails ?? []}
        currentPage={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
