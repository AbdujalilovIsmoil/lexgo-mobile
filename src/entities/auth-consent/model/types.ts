export type ConsentDoc = { id: string; slug: string; version: string; title: string };
export type ConsentDetail = ConsentDoc & { body: string };
export type PendingConsents = { phone: string; docs: { id: string; version: string }[] };
