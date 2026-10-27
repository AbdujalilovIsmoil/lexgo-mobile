import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { pickLoc } from "./localized";
import type { Plan } from "../model/types";

// Who a plan is shown to (contract §21). The viewer is a guest/client, an advokat or a yurist.
export type PlanViewer = "client" | "advokat" | "yurist";

const AUDIENCE: Record<PlanViewer, string[]> = {
  client: ["client", "personal"],
  advokat: ["advokat", "seller", "lawyer", "professional"],
  yurist: ["yurist", "seller", "legal_specialist", "professional"],
};

const words = (v: unknown): string[] => (Array.isArray(v) ? v : [v]).map((x) => asStr(x).trim().toLowerCase()).filter(Boolean);

// `audiences`, else the single `audience`, else `target_roles` — all of what the backend says about who the plan is for.
export function audiencesOf(d: Dict): string[] {
  const list = words(d.audiences);
  if (list.length) return list;
  const one = words(d.audience);
  return one.length ? one : words(d.target_roles);
}

// A plan with no audience information stays visible to everybody.
export const forViewer = (plan: Pick<Plan, "audiences">, viewer: PlanViewer): boolean => !plan.audiences.length || plan.audiences.some((a) => AUDIENCE[viewer].includes(a));

// The session's role as the plan audience: guests and clients see the client plans.
export const viewerOf = (role: string | undefined): PlanViewer => (role === "advocate" ? "advokat" : role === "lawyer" ? "yurist" : "client");

// Which side a card is meant for, for its caption: "client", "pro" (a professional audience only) or "" (both / unknown).
export function audienceKind(plan: Pick<Plan, "audiences">): "client" | "pro" | "" {
  const client = plan.audiences.some((a) => AUDIENCE.client.includes(a));
  const pro = plan.audiences.some((a) => AUDIENCE.advokat.includes(a) || AUDIENCE.yurist.includes(a));
  return client === pro ? "" : client ? "client" : "pro";
}

// `current_version` is a number in the catalogue, but may be a numeric string or an object ({ version, effective_from … }).
export function normVersion(d: Dict): { version: number; versioned: boolean; effectiveFrom: string } {
  const raw = d.current_version;
  const o = asDict(raw);
  const n = asNum(typeof raw === "object" && raw !== null ? o.version ?? o.number ?? o.current_version : raw, NaN);
  const date = asStr(o.effective_from ?? o.effective_at ?? o.published_at ?? d.effective_from ?? d.effective_at ?? d.version_effective_from ?? d.current_version_effective_from).trim();
  const ok = Number.isFinite(n) && n > 0;
  return { version: ok ? n : 1, versioned: ok, effectiveFrom: date };
}

// The ordered benefit lines, in the backend's order: the localized `features`, else `benefits`. A line may be a string or an object with
// its text (and an order); blanks are dropped.
export function benefitLines(d: Dict, locale: string): string[] {
  const f = asDict(d.features);
  const loc = Array.isArray(d.features) ? d.features : Array.isArray(f[locale]) ? f[locale] : Array.isArray(f.uz) ? f.uz : d.benefits;
  const rows = asArr(loc).map((x, i) => {
    const o = asDict(x);
    const text = typeof x === "string" ? x : pickLoc(o.text ?? o.title ?? o.label ?? o.name, locale, "");
    return { text: text.trim(), at: asNum(o.sort_order ?? o.order, i), i };
  });
  const ordered = rows.some((r) => r.at !== r.i);
  return (ordered ? [...rows].sort((a, b) => a.at - b.at || a.i - b.i) : rows).map((r) => r.text).filter(Boolean);
}
