import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";

// TZ.md §12: what the current paid period of the plan gives — each feature `unavailable` (locked), `limited` (a counter) or `unlimited`.
// The counters are the backend's; the phone never decrements them itself.
export type FeatureMode = "unavailable" | "limited" | "unlimited";
export type PlanFeature = { key: string; mode: FeatureMode; limit: number | null; used: number | null; remaining: number | null; resetsAt: string };
export type MyFeatures = { subscriptionId: string; planVersion: number | null; active: boolean; items: PlanFeature[] };
export type PlanContract = { subscriptionId: string; title: string; names: Record<string, string>; version: number | null; termsChanged: boolean; consentAccepted: boolean | null };

const num = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number.isFinite(asNum(v, NaN)) ? asNum(v) : null);

export function normFeatures(v: unknown): MyFeatures {
  const d = asDict(v);
  const items = asArr(d.items).map((x): PlanFeature => {
    const f = asDict(x);
    const raw = asStr(f.mode).toLowerCase();
    const mode: FeatureMode = f.allowed === false || raw === "unavailable" || raw === "disabled" ? "unavailable" : raw === "unlimited" ? "unlimited" : "limited";
    return { key: asStr(f.feature_key), mode, limit: num(f.limit), used: num(f.used), remaining: num(f.remaining), resetsAt: asStr(f.resets_at) };
  }).filter((f) => f.key);
  return { subscriptionId: asStr(d.subscription_id), planVersion: num(d.plan_version), active: d.active === true, items };
}

export const getMyFeatures = async (): Promise<MyFeatures> => normFeatures(await http("/subscriptions/me/features"));

export function normContract(v: unknown, id: string): PlanContract {
  const d = asDict(v);
  const snap = asDict(d.snapshot);
  const names: Record<string, string> = {};
  for (const [k, n] of Object.entries(asDict(asDict(snap.meta).name))) if (typeof n === "string" && n.trim()) names[k] = n;
  const consent = d.renewal_consent ? asDict(d.renewal_consent) : null;
  return {
    subscriptionId: asStr(d.subscription_id) || id,
    title: asStr(snap.title),
    names,
    version: num(snap.version ?? snap.plan_version ?? d.plan_version),
    termsChanged: d.renewal_terms_changed === true,
    consentAccepted: consent ? (typeof consent.accepted === "boolean" ? consent.accepted : null) : null,
  };
}

export const getContract = async (id: string): Promise<PlanContract> => normContract(await http(`/subscriptions/${encodeURIComponent(id)}/contract`), id);

// The client agrees to the plan's new terms for the next period (the current one keeps its snapshot).
export async function acceptRenewal(id: string): Promise<void> {
  await http(`/subscriptions/${encodeURIComponent(id)}/renewal-consent`, { method: "POST", body: { accepted: true } });
}

// The only way a feature is spent from the phone (TZ §12). Screens whose own endpoint already counts the use (template download, AI …)
// must not call it as well.
export async function consumeFeature(key: string, amount = 1): Promise<PlanFeature | null> {
  const d = asDict(await http(`/subscriptions/me/features/${encodeURIComponent(key)}/consume`, { method: "POST", body: { amount } }));
  const item = asDict(d.item ?? d.feature ?? d);
  return asStr(item.feature_key) ? normFeatures({ items: [item] }).items[0] ?? null : null;
}
