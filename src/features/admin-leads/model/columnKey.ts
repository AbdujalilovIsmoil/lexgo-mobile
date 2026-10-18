import type { Column } from "@/entities/admin-leads";

export const STATUS_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#db2777", "#6b7280"];
export const isHex = (v: string): boolean => /^#[0-9a-f]{6}$/i.test(v);

// A unique column key from the typed name (a fallback id when the name has no latin letters).
export function columnKey(name: string, cols: Column[]): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const seed = base || `col_${Date.now().toString(36)}`;
  const taken = new Set(cols.map((c) => c.key));
  let key = seed;
  for (let i = 2; taken.has(key); i++) key = `${seed}_${i}`;
  return key;
}
