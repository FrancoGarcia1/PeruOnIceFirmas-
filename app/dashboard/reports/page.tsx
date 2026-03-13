import { createSupabaseServer } from "@/lib/supabase-server";
import DailyReportCharts from "@/components/DailyReportCharts";

const PERU_TZ = "America/Lima"; // UTC-5, no DST

/** Get current date parts in Peru timezone */
function peruNow(): Date {
  const utc = new Date();
  // Format in Peru TZ to extract components
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(utc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return new Date(`${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}-05:00`);
}

/** Start of day in Peru time, returned as UTC ISO string for Supabase queries */
function peruStartOfDay(daysOffset: number): string {
  const now = peruNow();
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  // Set to 00:00:00 Peru time = 05:00:00 UTC
  const dateStr = d.toISOString().split("T")[0];
  return new Date(`${dateStr}T00:00:00-05:00`).toISOString();
}

/** End of day in Peru time, returned as UTC ISO string for Supabase queries */
function peruEndOfDay(daysOffset: number): string {
  const now = peruNow();
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  const dateStr = d.toISOString().split("T")[0];
  return new Date(`${dateStr}T23:59:59.999-05:00`).toISOString();
}

/** Convert a UTC ISO timestamp to Peru hour (0-23) */
function toPeruHour(isoString: string): number {
  const date = new Date(isoString);
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TZ, hour: "2-digit", hour12: false,
  }).format(date);
  return parseInt(hourStr, 10);
}

export default async function ReportsPage() {
  const supabase = await createSupabaseServer();

  const todayStart = peruStartOfDay(0);
  const todayEnd = peruEndOfDay(0);
  const yesterdayStart = peruStartOfDay(-1);
  const yesterdayEnd = peruEndOfDay(-1);
  const lwStart = peruStartOfDay(-7);
  const lwEnd = peruEndOfDay(-7);

  const [
    { data: todayContracts },
    { count: yesterdayCount },
    { count: lastWeekCount },
    { data: todayMinors },
  ] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, adult_name, adult_dni, adult_age, signed_at")
      .gte("signed_at", todayStart)
      .lte("signed_at", todayEnd)
      .order("signed_at", { ascending: true }),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .gte("signed_at", yesterdayStart)
      .lte("signed_at", yesterdayEnd),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .gte("signed_at", lwStart)
      .lte("signed_at", lwEnd),
    supabase
      .from("minors")
      .select("contract_id")
      .in(
        "contract_id",
        (
          await supabase
            .from("contracts")
            .select("id")
            .gte("signed_at", todayStart)
            .lte("signed_at", todayEnd)
        ).data?.map((c) => c.id) ?? []
      ),
  ]);

  const contracts = todayContracts ?? [];
  const totalToday = contracts.length;

  // Contracts with minors vs solo adults
  const contractIdsWithMinors = new Set(
    (todayMinors ?? []).map((m) => m.contract_id)
  );
  const withMinorsCount = contractIdsWithMinors.size;
  const soloAdultCount = totalToday - withMinorsCount;
  const totalMinorsToday = todayMinors?.length ?? 0;
  const totalPeopleToday = totalToday + totalMinorsToday;

  // Average age
  const ages = contracts
    .map((c) => c.adult_age)
    .filter((a): a is number => a != null && a > 0);
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;

  // Hourly breakdown (Peru timezone)
  const hourlyCounts: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyCounts[h] = 0;
  contracts.forEach((c) => {
    const hour = toPeruHour(c.signed_at);
    hourlyCounts[hour]++;
  });

  const hourlyData = Object.entries(hourlyCounts).map(([h, count]) => ({
    hour: `${h.padStart(2, "0")}:00`,
    contratos: count,
  }));

  // Peak hour
  let peakHour = "—";
  let peakCount = 0;
  Object.entries(hourlyCounts).forEach(([h, count]) => {
    if (count > peakCount) {
      peakCount = count;
      peakHour = `${h.padStart(2, "0")}:00`;
    }
  });

  // Comparison data
  const comparison = [
    { label: "Hoy", value: totalToday },
    { label: "Ayer", value: yesterdayCount ?? 0 },
    { label: "Mismo día semana pasada", value: lastWeekCount ?? 0 },
  ];

  // Type breakdown for pie chart
  const typeBreakdown = [
    { name: "Solo adulto", value: soloAdultCount },
    { name: "Con menores", value: withMinorsCount },
  ];

  const dateFormatted = new Date().toLocaleDateString("es-PE", {
    timeZone: PERU_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const SUMMARY_CARDS = [
    {
      label: "Contratos hoy",
      value: totalToday,
      color: "burgundy" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "Personas en pista",
      value: totalPeopleToday,
      color: "blue" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Menores hoy",
      value: totalMinorsToday,
      color: "green" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
        </svg>
      ),
    },
    {
      label: "Edad promedio",
      value: avgAge > 0 ? avgAge : "—",
      color: "purple" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const colorMap = {
    burgundy: { bg: "bg-burgundy/10", text: "text-burgundy", icon: "text-burgundy" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-500" },
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-dark">Reporte Diario</h2>
        <p className="text-dark-soft/60 mt-1 text-sm capitalize">{dateFormatted}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
        {SUMMARY_CARDS.map((card) => {
          const colors = colorMap[card.color];
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] md:text-xs font-semibold text-dark-soft/50 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-2xl md:text-3xl font-bold mt-2 ${colors.text}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <DailyReportCharts
        hourlyData={hourlyData}
        comparison={comparison}
        typeBreakdown={typeBreakdown}
        peakHour={peakHour}
        peakCount={peakCount}
      />

      {/* Hourly detail table */}
      {totalToday > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-400 to-purple-100" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4">
              Detalle por hora
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ice-dark/30">
                    <th className="text-left py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">
                      Hora
                    </th>
                    <th className="text-right py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">
                      Contratos
                    </th>
                    <th className="text-right py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">
                      % del día
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData
                    .filter((h) => h.contratos > 0)
                    .map((h) => (
                      <tr
                        key={h.hour}
                        className="border-b border-ice-dark/20 last:border-0 hover:bg-frost transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-dark">
                          {h.hour}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-burgundy">
                          {h.contratos}
                        </td>
                        <td className="py-2.5 px-3 text-right text-dark-soft/60">
                          {totalToday > 0
                            ? `${Math.round((h.contratos / totalToday) * 100)}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
