"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReportExportBar() {
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "daily";
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleDownload = async (format: "excel" | "pdf") => {
    const setLoading = format === "excel" ? setLoadingExcel : setLoadingPdf;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/export?format=${format}&period=${period}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "excel"
        ? `reporte-${period}-peru-on-ice.xlsx`
        : `reporte-${period}-peru-on-ice.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error al exportar. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 print:hidden">
      <button
        onClick={() => handleDownload("excel")}
        disabled={loadingExcel}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {loadingExcel ? "Generando..." : "Excel"}
      </button>
      <button
        onClick={() => handleDownload("pdf")}
        disabled={loadingPdf}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-burgundy text-white hover:bg-burgundy-dark transition-colors shadow-sm disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        {loadingPdf ? "Generando..." : "PDF"}
      </button>
    </div>
  );
}
