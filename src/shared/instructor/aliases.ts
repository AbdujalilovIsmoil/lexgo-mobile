// Legacy ids (colon style, used by the web guide and by TZ 9) ⇄ canonical dotted ids the backend answers
// with. The defaults mirror GET /ai/instructor/contract `target_aliases`; the live contract replaces them.
const DEFAULTS: Record<string, string> = {
  "plan:lexgo-ai-free": "pricing.plan.lexgo-ai-free",
  "plan:lexgo-ai-lite": "pricing.plan.lexgo-ai-lite",
  "plan:lexgo-ai-pro": "pricing.plan.lexgo-ai-pro",
  "plan:shaxsiy-advokat-standard": "pricing.plan.shaxsiy-advokat-standard",
  "plan:shaxsiy-advokat-premium": "pricing.plan.shaxsiy-advokat-premium",
  "marketplace:ai-search": "marketplace.ai-search.input",
  "button:create-document": "documents.create.open",
  "button:operator-support": "support.operator-handoff.button",
  "section:urgent-services": "urgent_advokat.services",
  "list:document-requests": "advocate.opportunities.list",
  "ai-help:current-page": "dashboard.ai-instructor.open",
};

let map: Record<string, string> = DEFAULTS;

export function setTargetAliases(next: Record<string, string> | undefined): void {
  map = next && Object.keys(next).length ? { ...DEFAULTS, ...next } : DEFAULTS;
}

// Any spelling → the canonical id (identity when it has no alias).
export const canonicalId = (id: string): string => map[id] ?? id;

// Do two spellings name the same element?
export const sameTarget = (a: string, b: string): boolean => a === b || canonicalId(a) === canonicalId(b);
