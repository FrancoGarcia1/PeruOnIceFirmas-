"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  contratos: number;
}

export default function StatsCharts({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-burgundy via-burgundy-light to-ice" />
      <div className="p-4 md:p-6">
        <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-6">
          Contratos por día (últimos 30 días)
        </h3>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F8" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#6B7280" }}
                interval="preserveEnd"
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
              <Bar
                dataKey="contratos"
                fill="#B22234"
                radius={[6, 6, 0, 0]}
                name="Contratos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
