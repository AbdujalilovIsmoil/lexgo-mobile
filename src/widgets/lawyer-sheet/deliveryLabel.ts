// 2880 → "2 kun ichida", 90 → "2 soat ichida" ("" when the seller gave no time).
export function deliveryLabel(t: (k: string, p?: Record<string, string | number>) => string, minutes: number): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes >= 1440) return t("mk2.deliveryDays", { n: Math.max(1, Math.round(minutes / 1440)) });
  return t("mk2.deliveryHours", { n: Math.max(1, Math.round(minutes / 60)) });
}
