import { createSupabaseServer } from "@/lib/supabase-server";
import { Suspense } from "react";
import ContractTable from "@/components/ContractTable";
import CajaFilterBar from "@/components/CajaFilterBar";
import { peruDateStr, toUTCIso } from "@/lib/peru-dates";

interface SearchParams {
  q?: string;
  page?: string;
  filter?: string;
}

const PAGE_SIZE = 20;

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServer();
  const search = params.q ?? "";
  const page = parseInt(params.page ?? "1");
  const filter = params.filter ?? "today";
  const offset = (page - 1) * PAGE_SIZE;

  // Rango de hoy en hora Perú
  const todayStr = peruDateStr(0);
  const todayStart = toUTCIso(todayStr, "start");
  const todayEnd = toUTCIso(todayStr, "end");

  let query = supabase
    .from("contracts")
    .select("*, minors(*)", { count: "exact" })
    .order("signed_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Filtro por fecha
  if (filter === "today") {
    query = query.gte("signed_at", todayStart).lte("signed_at", todayEnd);
  }

  // Búsqueda por nombre o DNI
  if (search) {
    query = query.or(
      `adult_name.ilike.%${search}%,adult_dni.ilike.%${search}%`
    );
  }

  const { data: contracts, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Conteo de personas hoy (adultos + menores)
  let totalPersonasHoy = 0;
  let totalMenoresHoy = 0;
  if (filter === "today") {
    const { data: todayContracts } = await supabase
      .from("contracts")
      .select("minors(id)")
      .gte("signed_at", todayStart)
      .lte("signed_at", todayEnd);

    totalPersonasHoy = todayContracts?.length ?? 0;
    totalMenoresHoy =
      todayContracts?.reduce(
        (acc, c) => acc + ((c.minors as { id: string }[])?.length ?? 0),
        0
      ) ?? 0;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark">Contratos</h2>
          {filter === "today" ? (
            <p className="text-dark-soft/60 mt-1 text-sm">
              Hoy:{" "}
              <span className="font-bold text-dark">
                {totalPersonasHoy} contrato{totalPersonasHoy !== 1 ? "s" : ""}
              </span>
              {totalMenoresHoy > 0 && (
                <span className="ml-2 text-dark-soft/50">
                  · {totalMenoresHoy} menor{totalMenoresHoy !== 1 ? "es" : ""}
                </span>
              )}
            </p>
          ) : (
            <p className="text-dark-soft/60 mt-1 text-sm">
              {count ?? 0} contrato{count !== 1 ? "s" : ""} en total
            </p>
          )}
        </div>

        {/* Contador de hoy destacado */}
        {filter === "today" && (
          <div className="flex gap-3">
            <div className="bg-burgundy/10 border border-burgundy/20 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-black text-burgundy leading-none">
                {totalPersonasHoy}
              </p>
              <p className="text-[10px] font-bold text-burgundy/60 uppercase tracking-wider mt-1">
                Contratos
              </p>
            </div>
            {totalMenoresHoy > 0 && (
              <div className="bg-ice border border-ice-dark/40 rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-black text-dark leading-none">
                  {totalMenoresHoy}
                </p>
                <p className="text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mt-1">
                  Menores
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <Suspense>
          <CajaFilterBar filter={filter} />
        </Suspense>
      </div>

      {filter === "today" && count === 0 ? (
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm px-6 py-16 text-center">
          <svg
            className="mx-auto mb-3 text-dark-soft/20"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-dark-soft/40 font-medium">
            Aún no hay contratos registrados hoy
          </p>
        </div>
      ) : (
        <ContractTable
          contracts={contracts ?? []}
          search={search}
          currentPage={page}
          totalPages={totalPages}
          basePath="/caja"
        />
      )}
    </div>
  );
}
