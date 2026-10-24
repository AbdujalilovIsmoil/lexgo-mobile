import { ApiError } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";

// The backend codes of TZ.md §16 that the order screens explain in their own words (mf.err.*).
export const FLOW_CODES = [
  "assignment_response_deadline_expired",
  "assignment_not_accepting",
  "marketplace_advance_payment_required",
  "required_checklist_incomplete",
  "marketplace_result_required",
  "marketplace_order_already_completed",
  "rating_window_closed",
  "complaint_window_closed",
] as const;
export type FlowCode = (typeof FLOW_CODES)[number];

// `detail.code` first (TZ §16), then a top-level code.
export function codeOf(e: unknown): string {
  if (!(e instanceof ApiError)) return "";
  return e.code || asStr(asDict(e.data.detail).code) || asStr(e.data.code);
}

export const isFlowCode = (c: string): c is FlowCode => (FLOW_CODES as readonly string[]).includes(c);

// The i18n key that explains a failed order action, or "" when the generic error text should be used. A 409 without a known code means
// the order moved on in the meantime: the caller refetches and says so.
export function flowErrorKey(e: unknown): string {
  const c = codeOf(e);
  if (isFlowCode(c)) return `mf.err.${c}`;
  return e instanceof ApiError && e.status === 409 ? "mf.err.conflict" : "";
}

// After these the order's state on the phone is stale: refetch before offering another action (TZ §16: 409 → refetch).
export const needsRefetch = (e: unknown): boolean => e instanceof ApiError && (e.status === 409 || e.status === 404 || isFlowCode(codeOf(e)));

export type BlockingItem = { id: string; title: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LISTS = ["blocking_items", "items", "blocking", "missing_items", "pending_items", "required_items", "incomplete_items", "checklist_items"];
const ID_LISTS = ["blocking_item_ids", "missing_item_ids", "pending_item_ids", "incomplete_item_ids", "item_ids"];

// `required_checklist_incomplete` names the items still blocking the completion (as objects, titles or ids); null for any other error.
export function blockingItems(e: unknown): BlockingItem[] | null {
  if (codeOf(e) !== "required_checklist_incomplete" || !(e instanceof ApiError)) return null;
  const detail = asDict(e.data.detail);
  const pick = (keys: string[]) => keys.map((k) => detail[k] ?? e.data[k]).find(Array.isArray) as unknown[] | undefined;
  const ids = pick(ID_LISTS);
  const list = pick(LISTS) ?? ids ?? [];
  return asArr(list).map((x) => {
    if (typeof x === "string" || typeof x === "number") {
      const s = String(x).trim();
      return ids || UUID.test(s) ? { id: s, title: "" } : { id: "", title: s };
    }
    const r = asDict(x);
    const inner = asDict(r.item ?? r.checklist_item);
    return { id: asStr(r.id ?? r.item_id ?? r.checklist_item_id ?? inner.id), title: asStr(r.title ?? r.name ?? r.label ?? inner.title ?? inner.name) };
  }).filter((b) => b.id || b.title);
}
