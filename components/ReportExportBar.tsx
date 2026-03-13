"use client";

interface ExportData {
  periodLabel: string;
  totalContracts: number;
  soloAdults: number;
  withMinors: number;
  totalMinors: number;
  totalPeople: number;
  avgAge: number;
  hourlyData: { hour: string; contratos: number }[];
  ageRanges: { range: string; count: number }[];
}

export default function ReportExportBar({ data }: { data: ExportData }) {
  const handleExportCSV = () => {
    const lines: string[] = [];
    lines.push(`Reporte ${data.periodLabel} - Peru On Ice`);
    lines.push("");
    lines.push("Resumen");
    lines.push(`Total contratos,${data.totalContracts}`);
    lines.push(`Personas en pista,${data.totalPeople}`);
    lines.push(`Solo adultos,${data.soloAdults}`);
    lines.push(`Con menores,${data.withMinors}`);
    lines.push(`Total menores,${data.totalMinors}`);
    lines.push(`Edad promedio,${data.avgAge}`);
    lines.push("");
    lines.push("Detalle por hora");
    lines.push("Hora,Contratos");
    data.hourlyData
      .filter((h) => h.contratos > 0)
      .forEach((h) => lines.push(`${h.hour},${h.contratos}`));
    lines.push("");
    lines.push("Demografia por edad");
    lines.push("Rango,Cantidad");
    data.ageRanges.forEach((a) => lines.push(`${a.range},${a.count}`));

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${data.periodLabel.toLowerCase().replace(/\s/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex gap-3 print:hidden">
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Excel (CSV)
      </button>
      <button
        onClick={handlePrintPDF}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-burgundy text-white hover:bg-burgundy-dark transition-colors shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        PDF
      </button>
    </div>
  );
}
