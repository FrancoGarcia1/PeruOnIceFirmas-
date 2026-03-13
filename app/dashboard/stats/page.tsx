import { createSupabaseServer } from "@/lib/supabase-server";
import StatsCharts from "@/components/StatsCharts";

const PERU_TZ = "America/Lima";

function peruStartOfDay(daysOffset: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const base = new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00-05:00`);
  base.setDate(base.getDate() + daysOffset);
  return base.toISOString();
}

export default async function StatsPage() {
  const supabase = await createSupabaseServer();

  const today = peruStartOfDay(0);
  const weekAgo = peruStartOfDay(-7);
  const thirtyDaysAgo = peruStartOfDay(-30);

  const [
    { count: totalContracts },
    { count: todayContracts },
    { count: weekContracts },
    { data: recentContracts },
    { count: totalMinors },
  ] = await Promise.all([
    supabase.from("contracts").select("*", { count: "exact", head: true }),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .gte("signed_at", today),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .gte("signed_at", weekAgo),
    supabase
      .from("contracts")
      .select("signed_at")
      .gte("signed_at", thirtyDaysAgo)
      .order("signed_at", { ascending: true }),
    supabase.from("minors").select("*", { count: "exact", head: true }),
  ]);

  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const peruDate = new Intl.DateTimeFormat("en-CA", { timeZone: PERU_TZ }).format(new Date(peruStartOfDay(-i)));
    dailyCounts[peruDate] = 0;
  }

  recentContracts?.forEach((c) => {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: PERU_TZ }).format(new Date(c.signed_at));
    if (dailyCounts[day] !== undefined) {
      dailyCounts[day]++;
    }
  });

  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
    }),
    contratos: count,
  }));

  const STAT_CARDS = [
    {
      label: "Total contratos",
      value: totalContracts ?? 0,
      color: "burgundy" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "Hoy",
      value: todayContracts ?? 0,
      color: "blue" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: "Esta semana",
      value: weekContracts ?? 0,
      color: "green" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      label: "Total menores",
      value: totalMinors ?? 0,
      color: "purple" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const colorMap = {
    burgundy: {
      bg: "bg-burgundy/10",
      text: "text-burgundy",
      icon: "text-burgundy",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: "text-blue-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      icon: "text-emerald-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-500",
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-dark">Estadísticas</h2>
        <p className="text-dark-soft/60 mt-1 text-sm">
          Resumen de actividad de contratos
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => {
          const colors = colorMap[card.color];
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-dark-soft/50 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${colors.text}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <StatsCharts data={chartData} />
    </div>
  );
}
