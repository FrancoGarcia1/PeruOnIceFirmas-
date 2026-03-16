"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CajaFilterBar({ filter }: { filter: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    params.delete("page");
    params.delete("q");
    router.push(`/caja?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 p-1 bg-white border border-ice-dark/40 rounded-xl w-fit shadow-sm">
      <button
        onClick={() => setFilter("today")}
        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
          filter === "today"
            ? "bg-burgundy text-white shadow-md shadow-burgundy/20"
            : "text-dark-soft/60 hover:text-dark"
        }`}
      >
        Hoy
      </button>
      <button
        onClick={() => setFilter("all")}
        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
          filter === "all"
            ? "bg-burgundy text-white shadow-md shadow-burgundy/20"
            : "text-dark-soft/60 hover:text-dark"
        }`}
      >
        Todos
      </button>
    </div>
  );
}
