// "1 soat 20 daq" style span; whole minutes, at least one.
export function fmtSpan(seconds: number, t: (key: string, p?: Record<string, string | number>) => string): string {
  const m = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return t("svcRules.locDurMin", { n: m });
  if (r === 0) return t("svcRules.locDurHour", { n: h });
  return t("svcRules.locDurHourMin", { h, m: r });
}

export function clockTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
