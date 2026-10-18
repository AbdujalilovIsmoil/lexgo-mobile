import type { DocField } from "../model/types";

// The backend's placeholder is often just "{label}" (the template's own marker);
// showing that inside the field would repeat the label, so only a real example
// ("+998900000000", "12.05.2026") is used as the hint.
export function placeholderOf(f: DocField): string | undefined {
  const p = (f.placeholder ?? "").trim();
  if (!p) return undefined;
  const bare = p.replace(/^\{+|\}+$/g, "").trim().toLowerCase();
  return bare === f.label.trim().toLowerCase() ? undefined : p;
}
