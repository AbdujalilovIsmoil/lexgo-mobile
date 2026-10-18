import type { Pkg, PkgComponent, PkgMilestone } from "./types";

// The form state of a package (strings for the inputs); `toBody` turns it into the API payload.
export type PkgDraft = { title: string; price: string; refund: string; included: string; excluded: string; components: PkgComponent[]; milestones: PkgMilestone[] };

export const emptyDraft = (): PkgDraft => ({ title: "", price: "", refund: "", included: "", excluded: "", components: [], milestones: [{ index: 1, title: "", percent: 100, criteria: "" }] });

export const fromPkg = (p: Pkg): PkgDraft => ({
  title: p.title, price: String(p.price || ""), refund: p.refundTerms, included: p.included.join("\n"), excluded: p.excluded.join("\n"),
  components: p.components, milestones: p.milestones.length ? p.milestones : emptyDraft().milestones,
});

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
export const percentSum = (d: PkgDraft) => d.milestones.reduce((n, m) => n + (m.percent || 0), 0);

// Body of POST/PATCH /admin/service-packages (the server recomputes the totals and the shares).
export const toBody = (d: PkgDraft) => ({
  title: d.title.trim(), price: Number(d.price) || undefined, refund_terms: d.refund.trim(), included: lines(d.included), excluded: lines(d.excluded),
  components: d.components.map((c) => ({ service_id: c.serviceId, client_price: c.clientPrice, seller_fee: c.sellerFee, kind: c.kind, quantity: c.quantity, unit: c.unit || "service" })),
  milestones: d.milestones.map((m, i) => ({ index: i + 1, title: m.title.trim(), percent: m.percent, criteria: m.criteria.trim() })),
});

// A draft can be sent to the server when it has a title, at least one component and milestones adding up to 100 %.
export const isReady = (d: PkgDraft) => !!d.title.trim() && d.components.length > 0 && percentSum(d) === 100 && d.milestones.every((m) => m.title.trim());
