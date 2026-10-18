import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

const ROLE: Record<string, string> = { call_center: "operator", call_center_lawyer: "operator", superadmin: "admin", advokat_tashkiloti: "org" };

// Translated status / topic / priority / role names; unknown keys fall back to a tidied slug.
export function useSupportLabels() {
  const { t } = useT();
  const pick = (ns: string, key: string) => {
    if (!key) return "";
    const full = `admSup.${ns}.${key}`;
    const v = t(full);
    return v !== full ? v : humanizeSlug(key);
  };
  return {
    status: (k: string) => pick("st", k),
    category: (k: string) => pick("cat", k),
    priority: (k: string) => pick("prio", k),
    role: (k: string) => pick("roles", ROLE[k] ?? k),
  };
}
