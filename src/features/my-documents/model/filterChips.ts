import type { DocMode } from "@/entities/my-document";

export type FilterChip = { key: "mode" | "status"; label: string };
type Names = { mode: (m: DocMode) => string; status: (s: string) => string };

// The filters set from the sheet, as chips that can be removed one by one (the group and the search have their own controls).
export function filterChips(f: { mode: "" | DocMode; status: string }, names: Names): FilterChip[] {
  const out: FilterChip[] = [];
  if (f.mode) out.push({ key: "mode", label: names.mode(f.mode) });
  if (f.status) out.push({ key: "status", label: names.status(f.status) });
  return out;
}
