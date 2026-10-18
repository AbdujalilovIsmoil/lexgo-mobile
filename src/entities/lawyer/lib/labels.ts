import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

// Region / practice-area slugs → translated words, falling back to a humanised slug
// (same as regionLabel / areaLabel on the web's matches page).
export function useGeoLabels() {
  const { t } = useT();
  const pick = (key: string, slug: string) => {
    const v = t(key);
    return v === key ? humanizeSlug(slug) : v;
  };
  const region = (r: string) => pick(`lawyers.regions.${r}`, r);
  const area = (a: string) =>
    a.split(",").map((x) => x.trim()).filter(Boolean).map((x) => pick(`services.areas.${x}`, x)).join(", ");
  return { region, area };
}
