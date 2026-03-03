import { createSupabaseServer } from "@/lib/supabase-server";
import StatsCharts from "@/components/StatsCharts";

export default async function StatsPage() {
  const supabase = await createSupabaseServer();

  // Total de contratos
  const { count: totalContracts } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true });

  // Contratos de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayContracts } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .gte("signed_at", today.toISOString());

  // Contratos de esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weekContracts } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .gte("signed_at", weekAgo.toISOString());

  // Contratos por día (últimos 30 días) para el gráfico
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentContracts } = await supabase
    .from("contracts")
    .select("signed_at")
    .gte("signed_at", thirtyDaysAgo.toISOString())
    .order("signed_at", { ascending: true });

  // Agrupar por día
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyCounts[key] = 0;
  }

  recentContracts?.forEach((c) => {
    const day = new Date(c.signed_at).toISOString().split("T")[0];
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

  // Total menores
  const { count: totalMinors } = await supabase
    .from("minors")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas</h2>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total contratos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalContracts ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {todayContracts ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Esta semana</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {weekContracts ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total menores</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {totalMinors ?? 0}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <StatsCharts data={chartData} />
    </div>
  );
}
