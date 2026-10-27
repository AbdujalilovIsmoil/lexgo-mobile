import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { htmlText } from "@/shared/lib/htmlText";
import type { CheckPreview, ClientRule, DurationUnit, Guarantee, GuaranteeIcon, RuntimeDuration, ServiceRuntime } from "../model/types";

const str = (v: unknown): string => asStr(v).trim();
const text = (v: unknown): string => htmlText(asStr(v));

const UNITS: Record<string, DurationUnit> = { minute: "minute", minutes: "minute", min: "minute", hour: "hour", hours: "hour", h: "hour", day: "day", days: "day", d: "day" };

// The backend's business week, documented as Monday–Friday (TZ §4.4) — what stands when an answer names none (the web portal does the same).
const WORK_WEEK = [1, 2, 3, 4, 5];

// "Monday-Friday" (what business_days_label says today) → [1…5]; read only when the backend sends no `business_weekdays`.
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const dayNo = (w: string): number => DAYS.indexOf(w.slice(0, 3)) + 1;
function weekdaysFromLabel(label: string): number[] {
  const range = /^([a-z]+)\s*[-–—]\s*([a-z]+)$/.exec(label.toLowerCase());
  if (range) {
    const [a, b] = [dayNo(range[1]), dayNo(range[2])];
    return a && b && a <= b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [];
  }
  const list = label.toLowerCase().split(/[\s,;/]+/).filter(Boolean).map(dayNo);
  return list.length && list.every(Boolean) ? [...new Set(list)].sort((x, y) => x - y) : [];
}

// { value, unit, calendar, business_weekdays, business_days_label } → a time to put into words, or null (0, or a unit the app does not know).
function normDuration(v: unknown): RuntimeDuration | null {
  const d = asDict(v);
  const value = asNum(d.value ?? d.duration_value);
  const unit = UNITS[str(d.unit ?? d.duration_unit).toLowerCase()];
  if (!(value > 0) || !unit) return null;
  const calendar = /^(business|working)/.test(str(d.calendar ?? d.duration_calendar).toLowerCase()) ? "business_days" : "calendar";
  const given = asArr(d.business_weekdays).map((x) => asNum(x)).filter((x) => Number.isInteger(x) && x >= 1 && x <= 7);
  const weekdays = calendar !== "business_days" ? [] : given.length ? [...new Set(given)].sort((x, y) => x - y) : weekdaysFromLabel(str(d.business_days_label));
  return { value, unit, calendar, weekdays };
}

// Who an item is for: K32 `audiences`, or a legacy scalar `audience` (advokat_yurist / executor are the professionals). Nothing given = everyone;
// the backend filters for the placement, the phone only keeps out what is explicitly not for the client (K32 §14).
function forClient(d: Dict): boolean {
  const list = asArr(d.audiences).map((x) => str(x).toLowerCase()).filter(Boolean);
  const one = str(d.audience).toLowerCase();
  const all = list.length ? list : one ? [one] : [];
  return !all.length || all.includes("client") || all.includes("all");
}

// A snake_case code ("full_refund") is not a sentence for the client.
const prose = (s: string): string => (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(s) ? "" : s);

function normClientRule(v: unknown): ClientRule {
  const r = asDict(v);
  return {
    id: str(r.id ?? r.rule_id ?? r.rule_key ?? r.key),
    title: text(r.title ?? r.name),
    version: str(r.version ?? r.rule_version),
    body: text(r.body ?? r.content ?? r.text ?? r.description),
  };
}

// The Studio icon name ("shield-check", "refund", "clock" …) → one of the app's few kinds, the same reading as the web portal's.
const ICONS: [RegExp, GuaranteeIcon][] = [[/refund|money|pul|qaytar|coin/, "refund"], [/clock|time|deadline|muddat/, "clock"], [/lock|secure|privacy/, "lock"], [/star|quality|sifat/, "star"], [/doc|file|hujjat/, "doc"], [/check|ok|done/, "check"]];
const iconOf = (v: unknown): GuaranteeIcon => ICONS.find(([re]) => re.test(str(v).toLowerCase()))?.[1] ?? "shield";

function normGuarantee(v: unknown): Guarantee {
  const g = asDict(v);
  return {
    id: str(g.id ?? g.guarantee_id ?? g.studio_object_id),
    icon: iconOf(g.icon),
    title: text(g.title ?? g.name),
    description: text(g.description ?? g.text ?? g.body),
    trigger: prose(text(g.trigger)),
    resolution: prose(text(g.resolution)),
    resolutionMinutes: Math.max(0, Math.round(asNum(g.resolution_minutes))),
  };
}

// TZ §9.3: the client title (the executor's only as a fallback, as the backend's own client view does) and the client description. An item that
// still carries the seller's fields keeps its `description` — the internal execution guidance — hidden.
const SELLER_FIELDS = ["client_title", "client_description", "executor_title", "show_comment_to_client", "show_images_to_client", "show_files_to_client"];
function normCheckPreview(v: unknown, i: number): CheckPreview {
  const r = asDict(v);
  const full = SELLER_FIELDS.some((k) => k in r);
  return {
    id: str(r.id ?? r.key ?? r.item_key) || `#${i}`,
    title: text(r.client_title) || text(r.title ?? r.name ?? r.label) || (full ? text(r.executor_title) : ""),
    description: text(full ? r.client_description : r.description),
    required: r.required === true || r.is_required === true,
  };
}

const orderOf = (v: unknown, i: number): number => {
  const n = asNum(asDict(v).order ?? asDict(v).sort_order ?? asDict(v).position, NaN);
  return Number.isFinite(n) ? n : 1e6 + i;
};

// An id that arrives twice is shown once (two rows with one id would also share a list key).
const once = <T extends { id: string }>(rows: T[]): T[] => rows.filter((r, i) => !r.id || rows.findIndex((x) => x.id === r.id) === i);

// The whole answer. Inactive guarantees and items for another audience are left out; `rules` is never read.
export function normRuntime(v: unknown, serviceId = "", placement = "service_detail"): ServiceRuntime {
  const d = asDict(v);
  const review = asDict(d.review);
  const duration = normDuration(d.duration);
  const time = normDuration(review);
  // The review names no business week of its own: it is the backend's one, the duration's (or the documented Monday–Friday).
  const week = duration?.weekdays.length ? duration.weekdays : WORK_WEEK;
  for (const x of [duration, time]) if (x?.calendar === "business_days" && !x.weekdays.length) x.weekdays = [...week];
  const checklist = asArr(d.checklist_preview)
    .map((x, i) => ({ at: orderOf(x, i), item: normCheckPreview(x, i) }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.item)
    .filter((x) => x.title);
  return {
    serviceId: str(d.service_id) || serviceId,
    placement: str(d.placement) || placement,
    duration,
    review: asNum(review.value) > 0 ? { time, clientNote: text(review.client_note) } : null,
    clientRules: once(asArr(d.client_rules).filter((x) => forClient(asDict(x))).map(normClientRule).filter((r) => r.title || r.body)),
    guarantees: once(asArr(d.guarantees).filter((x) => asDict(x).is_active !== false && forClient(asDict(x))).map(normGuarantee).filter((g) => g.title || g.description)),
    checklist: once(checklist),
  };
}
