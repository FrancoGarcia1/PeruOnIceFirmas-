import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getDateRange, toPeruHour, toPeruDate, peruDateStr, AGE_RANGES, PERIOD_LABELS, PERU_TZ } from "@/lib/peru-dates";
import type { Period } from "@/lib/peru-dates";
import * as XLSX from "xlsx";
import { spawn } from "child_process";
import path from "path";

async function fetchReportData(period: Period) {
  const supabase = await createSupabaseServer();
  const range = getDateRange(period);

  const [{ data: contracts }, { count: prevCount }, { data: minorsData }] = await Promise.all([
    supabase.from("contracts").select("id, adult_name, adult_dni, adult_age, signed_at").gte("signed_at", range.start).lte("signed_at", range.end).order("signed_at", { ascending: true }),
    supabase.from("contracts").select("*", { count: "exact", head: true }).gte("signed_at", range.prevStart).lte("signed_at", range.prevEnd),
    supabase.from("minors").select("contract_id, minor_name, minor_dni, minor_age").in("contract_id", (await supabase.from("contracts").select("id").gte("signed_at", range.start).lte("signed_at", range.end)).data?.map((c) => c.id) ?? []),
  ]);

  const items = contracts ?? [];
  const minors = minorsData ?? [];
  const contractIdsWithMinors = new Set(minors.map((m) => m.contract_id));
  const withMinorsCount = contractIdsWithMinors.size;
  const soloAdultCount = items.length - withMinorsCount;
  const ages = items.map((c) => c.adult_age).filter((a): a is number => a != null && a > 0);
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;
  const allAges = [...ages, ...minors.map((m) => m.minor_age).filter((a): a is number => a != null && a > 0)];
  const ageRanges = AGE_RANGES.map(({ label, min, max }) => ({ range: label, count: allAges.filter((a) => a >= min && a <= max).length }));

  let timeBreakdown: { label: string; count: number }[];
  if (period === "daily") {
    const counts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) counts[h] = 0;
    items.forEach((c) => { counts[toPeruHour(c.signed_at)]++; });
    timeBreakdown = Object.entries(counts).filter(([, n]) => n > 0).map(([h, n]) => ({ label: `${h.padStart(2, "0")}:00`, count: n }));
  } else {
    const days = period === "weekly" ? 7 : 30;
    const dayCounts: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) dayCounts[peruDateStr(-i)] = 0;
    items.forEach((c) => { const d = toPeruDate(c.signed_at); if (dayCounts[d] !== undefined) dayCounts[d]++; });
    timeBreakdown = Object.entries(dayCounts).filter(([, n]) => n > 0).map(([d, n]) => ({ label: d, count: n }));
  }

  const dateFormatted = new Date().toLocaleDateString("es-PE", { timeZone: PERU_TZ, weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return { items, minors, soloAdultCount, withMinorsCount, avgAge, ageRanges, timeBreakdown, prevCount: prevCount ?? 0, dateFormatted, totalPeople: items.length + minors.length };
}

function generateExcel(period: Period, data: Awaited<ReturnType<typeof fetchReportData>>): Buffer {
  const wb = XLSX.utils.book_new();
  const pl = PERIOD_LABELS[period];

  // Sheet 1: Resumen
  const summary = [
    ["REPORTE " + pl.toUpperCase() + " — PERÚ ON ICE"],
    ["Fecha del reporte", data.dateFormatted],
    [],
    ["Métrica", "Valor"],
    ["Total contratos", data.items.length],
    ["Personas en pista", data.totalPeople],
    ["Solo adultos", data.soloAdultCount],
    ["Con menores", data.withMinorsCount],
    ["Total menores", data.minors.length],
    ["Edad promedio adultos", data.avgAge],
    [],
    ["Comparativa"],
    ["Período actual", data.items.length],
    ["Período anterior", data.prevCount],
    ["Diferencia", data.items.length - data.prevCount],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(summary);
  wsResumen["!cols"] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // Sheet 2: Detalle temporal
  const timeHeader = period === "daily" ? "Hora" : "Fecha";
  const timeRows = [[timeHeader, "Contratos", "% del total"], ...data.timeBreakdown.map((t) => [t.label, t.count, data.items.length > 0 ? `${Math.round((t.count / data.items.length) * 100)}%` : "0%"])];
  const wsDetalle = XLSX.utils.aoa_to_sheet(timeRows);
  wsDetalle["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsDetalle, period === "daily" ? "Por Hora" : "Por Día");

  // Sheet 3: Demografía
  const demoRows = [["Rango de edad", "Cantidad", "% del total"], ...data.ageRanges.map((a) => {
    const total = data.items.length + data.minors.length;
    return [a.range, a.count, total > 0 ? `${Math.round((a.count / total) * 100)}%` : "0%"];
  })];
  const wsDemo = XLSX.utils.aoa_to_sheet(demoRows);
  wsDemo["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsDemo, "Demografía");

  // Sheet 4: Lista de contratos
  const contractRows = [
    ["Nombre", "DNI", "Edad", "Fecha y hora (Lima)", "Menores asociados"],
    ...data.items.map((c) => {
      const fecha = new Date(c.signed_at).toLocaleString("es-PE", { timeZone: PERU_TZ });
      const menores = data.minors.filter((m) => m.contract_id === c.id).map((m) => `${m.minor_name} - DNI: ${m.minor_dni ?? "—"} (${m.minor_age} años)`).join(", ");
      return [c.adult_name, c.adult_dni, c.adult_age ?? "—", fecha, menores || "Ninguno"];
    }),
  ];
  const wsContratos = XLSX.utils.aoa_to_sheet(contractRows);
  wsContratos["!cols"] = [{ wch: 35 }, { wch: 12 }, { wch: 8 }, { wch: 22 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsContratos, "Contratos");

  // Sheet 5: Menores
  if (data.minors.length > 0) {
    const minorRows = [
      ["Nombre del menor", "DNI", "Edad", "Contrato (adulto)"],
      ...data.minors.map((m) => {
        const adult = data.items.find((c) => c.id === m.contract_id);
        return [m.minor_name, m.minor_dni ?? "—", m.minor_age, adult?.adult_name ?? "—"];
      }),
    ];
    const wsMinors = XLSX.utils.aoa_to_sheet(minorRows);
    wsMinors["!cols"] = [{ wch: 35 }, { wch: 12 }, { wch: 8 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsMinors, "Menores");
  }

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

async function generatePDF(period: Period, data: Awaited<ReturnType<typeof fetchReportData>>): Promise<Buffer> {
  const scriptPath = path.join(process.cwd(), "lib", "generate-report-pdf.mjs");
  const input = JSON.stringify({
    periodLabel: PERIOD_LABELS[period],
    dateFormatted: data.dateFormatted,
    totalContracts: data.items.length,
    totalPeople: data.totalPeople,
    soloAdultCount: data.soloAdultCount,
    withMinorsCount: data.withMinorsCount,
    totalMinors: data.minors.length,
    avgAge: data.avgAge,
    timeBreakdown: data.timeBreakdown,
    ageRanges: data.ageRanges,
    prevCount: data.prevCount,
    contracts: data.items.map((c) => ({
      name: c.adult_name, dni: c.adult_dni, age: c.adult_age,
      signedAt: new Date(c.signed_at).toLocaleString("es-PE", { timeZone: PERU_TZ }),
      minors: data.minors.filter((m) => m.contract_id === c.id).map((m) => `${m.minor_name} - DNI: ${m.minor_dni ?? "—"} (${m.minor_age} años)`).join(", ") || "—",
    })),
    period,
  });

  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath], { stdio: ["pipe", "pipe", "pipe"] });
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Report PDF generation timed out"));
    }, 60_000); // reportes pueden tener más datos

    child.stdout.on("data", (c: Buffer) => chunks.push(c));
    child.stderr.on("data", (c: Buffer) => errChunks.push(c));
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`report-pdf exited ${code}: ${Buffer.concat(errChunks).toString().slice(0, 200)}`));
    });
    child.stdin.write(input);
    child.stdin.end();
  });
}

export async function GET(req: NextRequest) {
  // Verificar autenticación y rol admin
  const supabaseAuth = await createSupabaseServer();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const role = user?.app_metadata?.role as string | undefined;
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  const period = (["daily", "weekly", "monthly"].includes(url.searchParams.get("period") ?? "") ? url.searchParams.get("period") : "daily") as Period;

  if (format !== "excel" && format !== "pdf") {
    return NextResponse.json({ error: "format must be excel or pdf" }, { status: 400 });
  }

  const data = await fetchReportData(period);
  const pl = PERIOD_LABELS[period].toLowerCase();

  if (format === "excel") {
    const buffer = generateExcel(period, data);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte-${pl}-peru-on-ice.xlsx"`,
      },
    });
  }

  const pdfBuffer = await generatePDF(period, data);
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-${pl}-peru-on-ice.pdf"`,
    },
  });
}
