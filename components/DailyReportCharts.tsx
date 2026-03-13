"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface HourlyData {
  hour: string;
  contratos: number;
}

interface ComparisonData {
  label: string;
  value: number;
}

interface TypeBreakdown {
  name: string;
  value: number;
}

interface AgeRange {
  range: string;
  count: number;
}

interface Props {
  hourlyData: HourlyData[];
  comparison: ComparisonData[];
  typeBreakdown: TypeBreakdown[];
  ageRanges: AgeRange[];
  peakHour: string;
  peakCount: number;
  periodLabel: string;
}

const PIE_COLORS = ["#B22234", "#3B82F6"];
const AGE_COLORS = ["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#10B981", "#B22234", "#6366F1"];

export default function DailyReportCharts({
  hourlyData,
  comparison,
  typeBreakdown,
  ageRanges,
  peakHour,
  peakCount,
  periodLabel,
}: Props) {
  const currentLabel = comparison[0]?.label ?? "Actual";
  const hasData = hourlyData.some((h) => h.contratos > 0);

  return (
    <div className="space-y-6">
      {/* Hourly/daily bar chart */}
      <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-burgundy via-burgundy-light to-ice" />
        <div className="p-4 md:p-6">
          <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-6">
            Contratos por hora — {periodLabel}
          </h3>
          <div className="h-60 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F8" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: "#6B7280" }}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: "#C5DFE8" }}
                  tickLine={{ stroke: "#C5DFE8" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={{ stroke: "#C5DFE8" }}
                  tickLine={{ stroke: "#C5DFE8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #C5DFE8",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  cursor={{ fill: "#F0F7FA" }}
                />
                <Bar dataKey="contratos" fill="#B22234" radius={[6, 6, 0, 0]} name="Contratos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {peakCount > 0 && (
            <p className="text-sm text-dark-soft/60 mt-4 text-center">
              Hora/día pico: <span className="font-bold text-burgundy">{peakHour}</span> con{" "}
              <span className="font-bold text-burgundy">{peakCount}</span> contratos
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de ingreso */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-100" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
              Tipo de ingreso
            </h3>
            {typeBreakdown.every((t) => t.value === 0) ? (
              <p className="text-sm text-dark-soft/50 text-center py-10">Sin datos</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {typeBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend formatter={(value: string) => <span className="text-xs text-dark-soft">{value}</span>} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #C5DFE8", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Comparativa */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-100" />
          <div className="p-4 md:p-6">
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">
              Comparativa
            </h3>
            <div className="space-y-3">
              {comparison.map((item) => {
                const current = comparison[0]?.value ?? 0;
                const diff = current - item.value;
                const isCurrent = item.label === currentLabel;
                return (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-frost">
                    <span className="text-sm font-medium text-dark-soft">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-dark">{item.value}</span>
                      {!isCurrent && current > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0 ? "bg-emerald-100 text-emerald-700" : diff < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? "=" : diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Age demographics */}
      <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-100" />
        <div className="p-4 md:p-6">
          <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-6">
            Demografía por edad
          </h3>
          {!hasData ? (
            <p className="text-sm text-dark-soft/50 text-center py-10">Sin datos</p>
          ) : (
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageRanges} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F8" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#C5DFE8" }} />
                  <YAxis type="category" dataKey="range" tick={{ fontSize: 11, fill: "#6B7280" }} width={55} axisLine={{ stroke: "#C5DFE8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #C5DFE8", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} cursor={{ fill: "#F0F7FA" }} />
                  <Bar dataKey="count" name="Personas" radius={[0, 6, 6, 0]}>
                    {ageRanges.map((_, i) => (
                      <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
