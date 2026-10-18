import { useT } from "@/shared/i18n";

// Passport durations are free text ("5 daqiqa", "tezkor") or day counts ("3", "10-15").
export function useTerm(): (raw: string) => string {
  const { t } = useT();
  return (raw) => (/^\d+(\s*[-–]\s*\d+)?$/.test(raw.trim()) ? t("dc1.days", { n: raw.trim() }) : raw.trim());
}

// delivery_minutes of the service card → "5 daqiqa" / "2 soat" / "3 kun".
export function useMinutes(): (m: number) => string {
  const { t } = useT();
  return (m) => (m <= 0 ? "" : m < 90 ? t("dc1.minutes", { n: m }) : m < 2880 ? t("dc1.hours", { n: Math.round(m / 60) }) : t("dc1.days", { n: Math.round(m / 1440) }));
}
