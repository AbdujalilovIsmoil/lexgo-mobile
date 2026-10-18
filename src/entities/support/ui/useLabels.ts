import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { useSupportMeta } from "../model/queries";

// Translated status / topic / priority / role names; unknown keys use the backend's label or a tidied slug.
export function useSupportLabels() {
  const { t } = useT();
  const meta = useSupportMeta().data;
  const pick = (ns: string, key: string, list: { key: string; label: string }[] = []) => {
    if (!key) return "";
    const full = `sp4.${ns}.${key}`;
    const v = t(full);
    return v !== full ? v : list.find((o) => o.key === key)?.label || humanizeSlug(key);
  };
  return {
    status: (k: string) => pick("st", k),
    category: (k: string) => pick("cat", k, meta?.categories),
    priority: (k: string) => pick("prio", k, meta?.priorities),
    role: (k: string) => pick("roles", k),
  };
}
