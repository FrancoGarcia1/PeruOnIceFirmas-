export const PERU_TZ = "America/Lima";

export function peruDateStr(daysOffset: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const base = new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00-05:00`);
  base.setDate(base.getDate() + daysOffset);
  return base.toISOString().split("T")[0];
}

export function toUTCIso(dateStr: string, time: "start" | "end"): string {
  const t = time === "start" ? "T00:00:00-05:00" : "T23:59:59.999-05:00";
  return new Date(`${dateStr}${t}`).toISOString();
}

export function toPeruHour(iso: string): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: PERU_TZ, hour: "2-digit", hour12: false }).format(new Date(iso)),
    10
  );
}

export function toPeruDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PERU_TZ }).format(new Date(iso));
}

export type Period = "daily" | "weekly" | "monthly";

export const AGE_RANGES = [
  { label: "5-9", min: 5, max: 9 },
  { label: "10-15", min: 10, max: 15 },
  { label: "16-17", min: 16, max: 17 },
  { label: "18-25", min: 18, max: 25 },
  { label: "26-35", min: 26, max: 35 },
  { label: "36-50", min: 36, max: 50 },
  { label: "51+", min: 51, max: 999 },
];

export function getDateRange(period: Period) {
  const todayStr = peruDateStr(0);
  switch (period) {
    case "daily":
      return {
        start: toUTCIso(todayStr, "start"), end: toUTCIso(todayStr, "end"),
        prevStart: toUTCIso(peruDateStr(-1), "start"), prevEnd: toUTCIso(peruDateStr(-1), "end"),
        compStart: toUTCIso(peruDateStr(-7), "start"), compEnd: toUTCIso(peruDateStr(-7), "end"),
      };
    case "weekly":
      return {
        start: toUTCIso(peruDateStr(-6), "start"), end: toUTCIso(todayStr, "end"),
        prevStart: toUTCIso(peruDateStr(-13), "start"), prevEnd: toUTCIso(peruDateStr(-7), "end"),
        compStart: toUTCIso(peruDateStr(-13), "start"), compEnd: toUTCIso(peruDateStr(-7), "end"),
      };
    case "monthly":
      return {
        start: toUTCIso(peruDateStr(-29), "start"), end: toUTCIso(todayStr, "end"),
        prevStart: toUTCIso(peruDateStr(-59), "start"), prevEnd: toUTCIso(peruDateStr(-30), "end"),
        compStart: toUTCIso(peruDateStr(-59), "start"), compEnd: toUTCIso(peruDateStr(-30), "end"),
      };
  }
}

export const PERIOD_LABELS: Record<Period, string> = {
  daily: "Diario", weekly: "Semanal", monthly: "Mensual",
};
