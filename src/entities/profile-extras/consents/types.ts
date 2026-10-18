export type ConsentItem = { id: string; slug: string; version: string; title: string; titleRu: string; accepted: boolean; requiresReaccept: boolean; acceptedAt: string };
export type ConsentDoc = ConsentItem & { body: string };

// Documents meant for sellers only; a client sees them only if they already accepted one.
export const SELLER_ONLY = new Set(["lawyer_partnership_offer", "advocate_partnership", "organization_agreement"]);

export const needsAction = (c: ConsentItem): boolean => !c.accepted || c.requiresReaccept;
