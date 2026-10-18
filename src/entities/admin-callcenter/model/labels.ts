import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

// "Iqtisodiy" / "ma'muriy" / "mamuriy": the backend writes one practice area several ways.
export const slugKey = (s: string): string => s.trim().toLowerCase().replace(/[‘’'`ʻʼ]/g, "");

// Translate a backend slug under an i18n prefix (admCc.kind, admCc.dir …); unknown slugs are tidied, never shown raw.
export function useCcLabel() {
  const { t } = useT();
  return (prefix: string, slug: string): string => {
    if (!slug) return "";
    const key = `${prefix}.${slugKey(slug)}`;
    const v = t(key);
    return v === key ? humanizeSlug(slug) : v;
  };
}

// Region slug ("tashkent") → the app's region names; free text stays as typed.
export function useRegionLabel() {
  const { t } = useT();
  return (region: string): string => {
    const key = `lawyers.regions.${region.trim().toLowerCase()}`;
    const v = region ? t(key) : "";
    return v && v !== key ? v : region;
  };
}
