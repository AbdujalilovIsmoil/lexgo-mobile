import type { ConsentDoc } from "../model/types";

// Signed per order, or a website cookie banner: never part of the sign-up set.
const SKIP = new Set(["client_advocate_contract_template", "client_provider_contract", "cookie"]);
const SELLERS = ["yurist", "advokat", "advokat_tashkiloti"];
// Role-specific documents; any other slug applies to everybody (same rule as the web).
const FOR: Record<string, string[]> = {
  lawyer_partnership_offer: SELLERS,
  advocate_partnership: SELLERS,
  organization_agreement: ["advokat_tashkiloti"],
};
const ORDER = ["user_offer", "privacy", "personal_data_consent", "platform_rules", "age_18"];

// The newest version per slug that the chosen account type has to accept, in reading order.
export function signupDocs(docs: ConsentDoc[], role: string): ConsentDoc[] {
  const best = new Map<string, ConsentDoc>();
  for (const d of docs) {
    if (SKIP.has(d.slug) || (FOR[d.slug] && !FOR[d.slug].includes(role))) continue;
    const cur = best.get(d.slug);
    if (!cur || d.version.localeCompare(cur.version, undefined, { numeric: true }) > 0) best.set(d.slug, d);
  }
  const rank = (s: string) => (ORDER.includes(s) ? ORDER.indexOf(s) : ORDER.length);
  return [...best.values()].sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
}
