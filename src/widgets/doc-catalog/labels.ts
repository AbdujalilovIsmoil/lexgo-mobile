import { categoryKey } from "@/entities/doc-template";
import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string, vars?: Record<string, string | number>) => string;

// A category's display name: our short Uzbek name for the four known ones, else the server's title, else the key made readable.
export function categoryLabel(t: T, key: string, serverTitle = ""): string {
  const k = categoryKey(key);
  if (k) { const v = t(k); if (v !== k) return v; }
  return serverTitle || humanizeSlug(key.replace(/^legal-doc-/, ""));
}

// A language code ("uz-cyrl") in the person's own words; an unknown code is shown as it is, upper-case.
export function languageLabel(t: T, code: string): string {
  const k = `dcat.lang.${code}`;
  const v = t(k);
  return v === k ? code.toUpperCase() : v;
}
