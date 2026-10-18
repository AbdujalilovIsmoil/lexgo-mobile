import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string, params?: Record<string, string | number>) => string;

// Request status label: this package's own wording, then the shared admSt.*, then a tidied value.
export function statusLabel(t: T, status: string): string {
  for (const key of [`aw2.st.${status}`, `admSt.${status}`]) {
    const v = t(key);
    if (v !== key) return v;
  }
  return humanizeSlug(status);
}
