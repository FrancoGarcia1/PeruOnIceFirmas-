import { createSupabaseServer } from "@/lib/supabase-server";
import { getDateRange, toPeruHour, toPeruDate, peruDateStr, AGE_RANGES, PERIOD_LABELS, PERU_TZ } from "@/lib/peru-dates";
import type { Period } from "@/lib/peru-dates";
import DailyReportCharts from "@/components/DailyReportCharts";
import ReportPeriodSelector from "@/components/ReportPeriodSelector";
import ReportExportBar from "@/components/ReportExportBar";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (["daily", "weekly", "monthly"].includes(params.period ?? "") ? params.period : "daily") as Period;
  const supabase = await createSupabaseServer();
  const range = getDateRange(period);

  const [{ data: contracts }, { count: prevCount }, { data: minorsData }] = await Promise.all([
    supabase.from("contracts").select("id, adult_name, adult_dni, adult_age, signed_at").gte("signed_at", range.start).lte("signed_at", range.end).order("signed_at", { ascending: true }),
    supabase.from("contracts").select("*", { count: "exact", head: true }).gte("signed_at", range.prevStart).lte("signed_at", range.prevEnd),
    supabase.from("minors").select("contract_id, minor_age").in("contract_id", (await supabase.from("contracts").select("id").gte("signed_at", range.start).lte("signed_at", range.end)).data?.map((c) => c.id) ?? []),
  ]);

  let compCount = prevCount;
  if (period === "daily") {
    const { count } = await supabase.from("contracts").select("*", { count: "exact", head: true }).gte("signed_at", range.compStart).lte("signed_at", range.compEnd);
    compCount = count;
  }

  const items = contracts ?? [];
  const minors = minorsData ?? [];
  const totalContracts = items.length;
  const contractIdsWithMinors = new Set(minors.map((m) => m.contract_id));
  const withMinorsCount = contractIdsWithMinors.size;
  const soloAdultCount = totalContracts - withMinorsCount;
  const totalMinors = minors.length;
  const totalPeople = totalContracts + totalMinors;

  const ages = items.map((c) => c.adult_age).filter((a): a is number => a != null && a > 0);
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;

  const allAges = [...ages, ...minors.map((m) => m.minor_age).filter((a): a is number => a != null && a > 0)];
  const ageRanges = AGE_RANGES.map(({ label, min, max }) => ({ range: label, count: allAges.filter((a) => a >= min && a <= max).length }));

  let hourlyData: { hour: string; contratos: number }[];
  let peakHour = "—";
  let peakCount = 0;

  if (period === "daily") {
    const counts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) counts[h] = 0;
    items.forEach((c) => { counts[toPeruHour(c.signed_at)]++; });
    hourlyData = Object.entries(counts).map(([h, n]) => ({ hour: `${h.padStart(2, "0")}:00`, contratos: n }));
    Object.entries(counts).forEach(([h, n]) => { if (n > peakCount) { peakCount = n; peakHour = `${h.padStart(2, "0")}:00`; } });
  } else {
    const days = period === "weekly" ? 7 : 30;
    const dayCounts: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) dayCounts[peruDateStr(-i)] = 0;
    items.forEach((c) => { const d = toPeruDate(c.signed_at); if (dayCounts[d] !== undefined) dayCounts[d]++; });
    hourlyData = Object.entries(dayCounts).map(([d, n]) => ({ hour: new Date(d + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }), contratos: n }));
    Object.entries(dayCounts).forEach(([d, n]) => {
      if (n > peakCount) { peakCount = n; peakHour = new Date(d + "T12:00:00").toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "2-digit" }); }
    });
  }

  const periodLabel = PERIOD_LABELS[period];
  const compLabels: Record<Period, [string, string]> = { daily: ["Ayer", "Mismo día sem. pasada"], weekly: ["Semana anterior", "Semana anterior"], monthly: ["Mes anterior", "Mes anterior"] };
  const comparison = [
    { label: periodLabel, value: totalContracts },
    { label: compLabels[period][0], value: prevCount ?? 0 },
    ...(period === "daily" ? [{ label: compLabels[period][1], value: compCount ?? 0 }] : []),
  ];

  const typeBreakdown = [
    { name: "Solo adulto", value: soloAdultCount },
    { name: "Con menores", value: withMinorsCount },
  ];

  const dateFormatted = new Date().toLocaleDateString("es-PE", { timeZone: PERU_TZ, weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const CARDS = [
    { label: "Contratos", value: totalContracts, color: "burgundy" as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
    { label: "Personas en pista", value: totalPeople, color: "blue" as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: "Menores", value: totalMinors, color: "green" as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" /></svg> },
    { label: "Edad promedio", value: avgAge > 0 ? avgAge : "—", color: "purple" as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ];

  const colorMap = {
    burgundy: { bg: "bg-burgundy/10", text: "text-burgundy", icon: "text-burgundy" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-500" },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark">Reportes</h2>
          <p className="text-dark-soft/60 mt-1 text-sm capitalize">{dateFormatted}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ReportPeriodSelector />
          <ReportExportBar />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
        {CARDS.map((card) => {
          const c = colorMap[card.color];
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] md:text-xs font-semibold text-dark-soft/50 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold mt-2 ${c.text}`}>{card.value}</p>
                </div>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>{card.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      <DailyReportCharts hourlyData={hourlyData} comparison={comparison} typeBreakdown={typeBreakdown} ageRanges={ageRanges} peakHour={peakHour} peakCount={peakCount} periodLabel={periodLabel} />

      {totalContracts > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-400 to-purple-100" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4">
              {period === "daily" ? "Detalle por hora" : "Detalle por día"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ice-dark/30">
                    <th className="text-left py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">{period === "daily" ? "Hora" : "Día"}</th>
                    <th className="text-right py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">Contratos</th>
                    <th className="text-right py-2 px-3 text-xs text-dark-soft/50 font-semibold uppercase">% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData.filter((h) => h.contratos > 0).map((h) => (
                    <tr key={h.hour} className="border-b border-ice-dark/20 last:border-0 hover:bg-frost transition-colors">
                      <td className="py-2.5 px-3 font-medium text-dark">{h.hour}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-burgundy">{h.contratos}</td>
                      <td className="py-2.5 px-3 text-right text-dark-soft/60">{Math.round((h.contratos / totalContracts) * 100)}%</td>
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
