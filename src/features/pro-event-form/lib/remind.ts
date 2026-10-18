type T = (key: string, params?: Record<string, string | number>) => string;

// 0 → "no reminder", 30 → "30 min before", 60 → "1 h before", 1440 → "1 day before".
export function remindLabel(t: T, min: number): string {
  if (min <= 0) return t("aw6.remind.none");
  if (min % 1440 === 0) return t("aw6.remind.day", { n: min / 1440 });
  if (min % 60 === 0) return t("aw6.remind.hour", { n: min / 60 });
  return t("aw6.remind.min", { n: min });
}
