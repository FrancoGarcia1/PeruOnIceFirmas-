import { createSupabaseServer } from "@/lib/supabase-server";
import TrashTable from "@/components/TrashTable";

const PAGE_SIZE = 20;

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const search = params.q?.trim() ?? "";
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("contracts")
    .select("*, minors(*)", { count: "exact" })
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) {
    query = query.or(
      `adult_name.ilike.%${search}%,adult_dni.ilike.%${search}%`
    );
  }

  const { data: contracts, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-dark">Papelera</h2>
        <p className="text-dark-soft/60 mt-1 text-sm">
          {count ?? 0} contrato{(count ?? 0) !== 1 ? "s" : ""} en papelera
        </p>
      </div>

      <TrashTable
        contracts={contracts ?? []}
        search={search}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
