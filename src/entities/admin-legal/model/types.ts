export type ConsentDoc = { id: string; slug: string; version: string; title: string; body: string; active: boolean; major: boolean; createdAt: string };
export type UserConsent = { id: string; userId: string; consentId: string; slug: string; version: string; acceptedAt: string; ip: string };
export type DocInput = { slug: string; version: string; title: string; body: string; active: boolean; major: boolean };
// ready = a real text is published; placeholder = a stub (under 120 chars); missing = nothing published yet.
export type DocState = "ready" | "placeholder" | "missing";
export type DocSlot = { slug: string; versions: ConsentDoc[]; current?: ConsentDoc; state: DocState };

// The 10 documents the platform must publish (S-53); the seed only ships a few.
export const REQUIRED_SLUGS = ["terms", "privacy", "cookie", "advocate_partnership", "organization_agreement", "client_provider_contract", "payment_refund_warranty", "platform_rules", "personal_data", "age_18"];
export const PLACEHOLDER_MAX = 120;
