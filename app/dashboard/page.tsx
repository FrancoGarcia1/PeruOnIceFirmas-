import { createSupabaseServer } from "@/lib/supabase-server";
import ContractTable from "@/components/ContractTable";

interface SearchParams {
  q?: string;
  page?: string;
}

const PAGE_SIZE = 20;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServer();
  const search = params.q ?? "";
  const page = parseInt(params.page ?? "1");
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("contracts")
    .select("*, minors(*)", { count: "exact" })
    .order("signed_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (search) {
    query = query.or(
      `adult_name.ilike.%${search}%,adult_dni.ilike.%${search}%`
    );
  }

  const { data: contracts, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
        <p className="text-gray-500 mt-1">
          {count ?? 0} contrato{count !== 1 ? "s" : ""} registrado
          {count !== 1 ? "s" : ""}
        </p>
      </div>

      <ContractTable
        contracts={contracts ?? []}
        search={search}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
