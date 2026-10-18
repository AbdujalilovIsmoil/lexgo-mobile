import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

// "Iqtisodiy" / "ma'muriy" / "mamuriy": the backend writes one practice area several ways.
const slugKey = (s: string): string => s.trim().toLowerCase().replace(/[‘’'`ʻʼ]/g, "");

// Translate a backend slug under an i18n prefix; an unknown slug is tidied, never shown raw.
export function useUrgentLabels() {
  const { t } = useT();
  const pick = (prefix: string, slug: string): string => {
    if (!slug) return "";
    const key = `${prefix}.${slugKey(slug)}`;
    const v = t(key);
    return v === key ? humanizeSlug(slug) : v;
  };
  const region = (slug: string): string => {
    const key = `lawyers.regions.${slug.trim().toLowerCase()}`;
    const v = slug ? t(key) : "";
    return v && v !== key ? v : slug;
  };
  // A translation when the key exists, otherwise what the backend itself sent.
  const text = (key: string, fallback: string): string => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  return {
    text,
    kind: (s: string, fallback = "") => pick("ug4.kind", s) || fallback,
    dir: (s: string) => pick("ug4.dir", s),
    status: (s: string) => pick("ug4.status", s || "open_pool"),
    channel: (s: string) => pick("ug4.ch", s),
    call: (s: string) => pick("ug4.call", s),
    source: (s: string) => pick("ug4.src", s),
    region,
  };
}
export type UrgentLabels = ReturnType<typeof useUrgentLabels>;
