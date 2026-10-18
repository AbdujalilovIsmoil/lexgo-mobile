import type { IconName } from "@/shared/ui";

type Meta = { icon: IconName; group: string; key: string };

// Icon, section and i18n key of the constructors the web knows (lib/studio/constructors.ts).
const META: Record<string, Meta> = {
  K01: { icon: "compass", group: "marketplace", key: "k01" },
  K02: { icon: "briefcase", group: "marketplace", key: "k02" },
  "K03-M": { icon: "package", group: "marketplace", key: "k03m" },
  K04: { icon: "dollar-sign", group: "marketplace", key: "k04" },
  K05: { icon: "clipboard", group: "documents", key: "k05" },
  K06: { icon: "file-text", group: "documents", key: "k06" },
  K07: { icon: "file", group: "documents", key: "k07" },
  K08: { icon: "list", group: "quality", key: "k08" },
  K09: { icon: "check-square", group: "quality", key: "k09" },
  K10: { icon: "calendar", group: "quality", key: "k10" },
  K11: { icon: "lock", group: "documents", key: "k11" },
  "K12-M": { icon: "users", group: "marketplace", key: "k12m" },
  "K12-PROMO": { icon: "volume-2", group: "marketplace", key: "k12promo" },
  K13: { icon: "award", group: "quality", key: "k13" },
  K14: { icon: "bell", group: "documents", key: "k14" },
  K15: { icon: "cpu", group: "system", key: "k15" },
  K16: { icon: "folder", group: "system", key: "k16" },
  K29: { icon: "plus-square", group: "marketplace", key: "k29" },
  K19: { icon: "globe", group: "marketplace", key: "k19" },
  K20: { icon: "git-merge", group: "system", key: "k20" },
  M1: { icon: "target", group: "quality", key: "m1" },
  M2: { icon: "thumbs-up", group: "quality", key: "m2" },
  M3: { icon: "bar-chart-2", group: "system", key: "m3" },
  CORE: { icon: "layers", group: "system", key: "core" },
};

export const GROUP_COLOR: Record<string, string> = { marketplace: "#3B82F6", documents: "#8B5CF6", quality: "#22C55E", system: "#64748B" };
export const ORDER = Object.keys(META);

// Constructors the web has no entry for are grouped by the category the server sends.
export const ctorMeta = (code: string, category = ""): Meta => META[code] ?? { icon: "grid", group: category || "system", key: "" };
export const ctorOrder = (code: string): number => (ORDER.indexOf(code) < 0 ? ORDER.length : ORDER.indexOf(code));
export const ctorTint = (code: string, category = ""): string => GROUP_COLOR[ctorMeta(code, category).group] ?? "#06B6D4";
export const byOrder = (a: string, b: string): number => ctorOrder(a) - ctorOrder(b) || a.localeCompare(b);
