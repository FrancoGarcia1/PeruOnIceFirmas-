"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
] as const;

export type Period = (typeof PERIODS)[number]["key"];

export default function ReportPeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as Period) || "daily";

  const handleChange = (period: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleChange(key)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            current === key
              ? "bg-burgundy text-white shadow-md shadow-burgundy/25"
              : "bg-white text-dark-soft/60 border border-ice-dark/40 hover:border-burgundy/30 hover:text-burgundy"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
