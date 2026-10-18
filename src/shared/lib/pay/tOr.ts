import { humanizeSlug } from "@/shared/lib/format";

// Translation for a backend-provided code ("claimed", "order_commission"): the translated word when
// the key exists, otherwise the code tidied up — never a raw key on screen.
export function tOr(t: (key: string) => string, prefix: string, code: string): string {
  const key = `${prefix}.${code.trim().toLowerCase()}`;
  const v = /^[a-z0-9_]+$/.test(code.trim().toLowerCase()) ? t(key) : key;
  return v === key ? humanizeSlug(code) : v;
}
