// "real_estate" -> "Real estate" (web lib/lawyers humanizeSlug).
export function humanizeSlug(s: string): string {
  const cleaned = (s || "").replace(/^(fixture|service|area|category)[-_]/i, "").replace(/[-_]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : s;
}
