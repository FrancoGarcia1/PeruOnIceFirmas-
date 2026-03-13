import { renderToStream } from "@react-pdf/renderer/lib/react-pdf.js";
import { createElement as h } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer/lib/react-pdf.js";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", async () => {
  const data = JSON.parse(input);

  const s = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
    title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#B22234", marginBottom: 4 },
    subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#B22234", marginTop: 18, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#E8F4F8" },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#E8F4F8" },
    summaryLabel: { fontSize: 10, color: "#444" },
    summaryValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1A1A2E" },
    tableHeader: { flexDirection: "row", backgroundColor: "#B22234", paddingVertical: 5, paddingHorizontal: 4 },
    tableHeaderCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
    tableRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: "#E8F4F8" },
    tableRowAlt: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: "#E8F4F8", backgroundColor: "#F8FBFD" },
    tableCell: { fontSize: 8, color: "#333" },
    footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 7, color: "#999" },
    badge: { backgroundColor: "#ECFDF5", padding: "2 6", borderRadius: 4 },
    badgeNeg: { backgroundColor: "#FEF2F2", padding: "2 6", borderRadius: 4 },
    compRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#E8F4F8" },
  });

  const diff = data.totalContracts - data.prevCount;
  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;

  const summaryItems = [
    ["Total contratos", `${data.totalContracts}`],
    ["Personas en pista", `${data.totalPeople}`],
    ["Solo adultos", `${data.soloAdultCount}`],
    ["Con menores", `${data.withMinorsCount}`],
    ["Total menores", `${data.totalMinors}`],
    ["Edad promedio", data.avgAge > 0 ? `${data.avgAge} años` : "—"],
    ["Período anterior", `${data.prevCount} (${diffLabel})`],
  ];

  const doc = h(Document, null,
    h(Page, { size: "A4", style: s.page },
      // Header
      h(Text, { style: s.title }, `Reporte ${data.periodLabel} — Perú On Ice`),
      h(Text, { style: s.subtitle }, data.dateFormatted),

      // Resumen
      h(Text, { style: s.sectionTitle }, "RESUMEN"),
      ...summaryItems.map(([label, value], i) =>
        h(View, { key: `s${i}`, style: s.summaryRow },
          h(Text, { style: s.summaryLabel }, label),
          h(Text, { style: s.summaryValue }, value)
        )
      ),

      // Detalle temporal
      h(Text, { style: s.sectionTitle }, data.period === "daily" ? "DETALLE POR HORA" : "DETALLE POR DÍA"),
      h(View, { style: s.tableHeader },
        h(Text, { style: { ...s.tableHeaderCell, width: "40%" } }, data.period === "daily" ? "Hora" : "Fecha"),
        h(Text, { style: { ...s.tableHeaderCell, width: "30%", textAlign: "right" } }, "Contratos"),
        h(Text, { style: { ...s.tableHeaderCell, width: "30%", textAlign: "right" } }, "% del total"),
      ),
      ...data.timeBreakdown.map((t, i) =>
        h(View, { key: `t${i}`, style: i % 2 === 0 ? s.tableRow : s.tableRowAlt },
          h(Text, { style: { ...s.tableCell, width: "40%" } }, t.label),
          h(Text, { style: { ...s.tableCell, width: "30%", textAlign: "right", fontFamily: "Helvetica-Bold" } }, `${t.count}`),
          h(Text, { style: { ...s.tableCell, width: "30%", textAlign: "right" } }, data.totalContracts > 0 ? `${Math.round((t.count / data.totalContracts) * 100)}%` : "0%"),
        )
      ),

      // Demografía
      h(Text, { style: s.sectionTitle }, "DEMOGRAFÍA POR EDAD"),
      h(View, { style: s.tableHeader },
        h(Text, { style: { ...s.tableHeaderCell, width: "40%" } }, "Rango"),
        h(Text, { style: { ...s.tableHeaderCell, width: "30%", textAlign: "right" } }, "Cantidad"),
        h(Text, { style: { ...s.tableHeaderCell, width: "30%", textAlign: "right" } }, "% del total"),
      ),
      ...data.ageRanges.map((a, i) => {
        const total = data.totalPeople;
        return h(View, { key: `a${i}`, style: i % 2 === 0 ? s.tableRow : s.tableRowAlt },
          h(Text, { style: { ...s.tableCell, width: "40%", fontFamily: "Helvetica-Bold" } }, `${a.range} años`),
          h(Text, { style: { ...s.tableCell, width: "30%", textAlign: "right" } }, `${a.count}`),
          h(Text, { style: { ...s.tableCell, width: "30%", textAlign: "right" } }, total > 0 ? `${Math.round((a.count / total) * 100)}%` : "0%"),
        );
      }),

      // Footer
      h(Text, { style: s.footer }, `Perú On Ice — Reporte generado el ${data.dateFormatted} — Documento confidencial`),
    ),

    // Page 2: Lista de contratos
    h(Page, { size: "A4", style: s.page },
      h(Text, { style: s.sectionTitle }, "LISTA DE CONTRATOS"),
      h(View, { style: s.tableHeader },
        h(Text, { style: { ...s.tableHeaderCell, width: "30%" } }, "Nombre"),
        h(Text, { style: { ...s.tableHeaderCell, width: "12%" } }, "DNI"),
        h(Text, { style: { ...s.tableHeaderCell, width: "8%" } }, "Edad"),
        h(Text, { style: { ...s.tableHeaderCell, width: "22%" } }, "Fecha/Hora"),
        h(Text, { style: { ...s.tableHeaderCell, width: "28%" } }, "Menores"),
      ),
      ...data.contracts.map((c, i) =>
        h(View, { key: `c${i}`, style: i % 2 === 0 ? s.tableRow : s.tableRowAlt },
          h(Text, { style: { ...s.tableCell, width: "30%" } }, c.name),
          h(Text, { style: { ...s.tableCell, width: "12%" } }, c.dni),
          h(Text, { style: { ...s.tableCell, width: "8%" } }, c.age ? `${c.age}` : "—"),
          h(Text, { style: { ...s.tableCell, width: "22%" } }, c.signedAt),
          h(Text, { style: { ...s.tableCell, width: "28%" } }, c.minors),
        )
      ),
      h(Text, { style: s.footer }, `Perú On Ice — Reporte generado el ${data.dateFormatted} — Documento confidencial`),
    ),
  );

  const stream = await renderToStream(doc);
  stream.pipe(process.stdout);
});
