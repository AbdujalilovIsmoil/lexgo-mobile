// The last `n` months as { value: "YYYY-MM", label: "October 2026" } options (newest first).
export function monthOptions(locale: string, n = 24): { value: string; label: string }[] {
  const tag = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ";
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString(tag, { month: "long", year: "numeric" }) };
  });
}
