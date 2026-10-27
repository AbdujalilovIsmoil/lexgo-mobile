import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { CallKind, CheckFile, CheckItem, CheckStatus, Checklist, ChecklistProgress, FinPayment, Financials, FlowDuration, FlowEvent, FlowOrder, OrderComplaint, OrderRefund, OrderResolution, OrderReview, PayKind, PayPart, PriceComponent, PriceSnapshot, ResolutionChoice, RuntimeCaps, WarrantyResolution } from "../model/types";

const bool = (...v: unknown[]): boolean | null => {
  for (const x of v) if (typeof x === "boolean") return x;
  return null;
};
const num = (...v: unknown[]): number | null => {
  for (const x of v) {
    if (x === null || x === undefined || x === "" || typeof x === "boolean") continue;
    const n = typeof x === "number" ? x : Number(x);
    if (Number.isFinite(n)) return n;
  }
  return null;
};
const first = (...v: unknown[]): string => v.map((x) => asStr(x).trim()).find(Boolean) ?? "";
// Only a plain API path or an https link is followed; anything else reads as "not offered".
const path = (v: unknown): string => {
  const s = asStr(v).trim();
  return /^\//.test(s) || /^https:\/\//i.test(s) ? s : "";
};
const https = (v: unknown): string => (/^https:\/\/\S+$/i.test(asStr(v).trim()) ? asStr(v).trim() : "");
const ROOM_UPLOAD = /\/secure-chats\/([^/?#]+)\/messages\/upload/;
const CALLS: CallKind[] = ["audio", "video"];

function part(pay: Dict, kind: "advance" | "final"): PayPart | null {
  const amount = uzs(pay, `${kind}_amount`);
  return amount > 0 ? { percent: num(pay[`${kind}_percent`]), amount } : null;
}

function progressOf(v: unknown, items: CheckItem[] = [], counts: Dict = {}): ChecklistProgress {
  const done = items.filter((i) => i.status !== "pending");
  const req = items.filter((i) => i.required);
  const own = { done: done.length, total: items.length, requiredDone: req.filter((i) => i.status !== "pending").length, requiredTotal: req.length, percent: items.length ? Math.round((done.length / items.length) * 100) : 0 };
  const base = { ...own, done: num(counts.completed_count) ?? own.done, total: num(counts.total_count) ?? own.total, percent: num(counts.progress_percent) ?? own.percent };
  if (typeof v === "number" && Number.isFinite(v)) return { ...base, percent: v };
  const p = asDict(v);
  if (!Object.keys(p).length) return base;
  return {
    done: num(p.done, p.completed, p.done_count, p.completed_count) ?? base.done,
    total: num(p.total, p.total_count) ?? base.total,
    requiredDone: num(p.required_done, p.required_completed, p.required_completed_count) ?? base.requiredDone,
    requiredTotal: num(p.required_total, p.required_count, p.required_total_count) ?? base.requiredTotal,
    percent: num(p.percent, p.progress_percent, p.percentage) ?? base.percent,
  };
}

// The TZ fields of one marketplace order, read from the order payload (list row or detail), for either side.
export function normFlow(v: unknown): FlowOrder {
  const d = asDict(v);
  const det = asDict(d.details);
  const act = asDict(d.actions);
  const chat = asDict(d.chat ?? d.chat_state ?? det.chat_state);
  const fin = asDict(asDict(det.financial_snapshot ?? d.financial_snapshot).payment);
  const types = [d.allowed_call_types, d.calls_allowed, det.allowed_call_types, chat.allowed_call_types].find(Array.isArray) as unknown[] | undefined;
  const callTypes = types ? CALLS.filter((k) => types.map((x) => asStr(x).toLowerCase()).includes(k)) : [...CALLS];
  const url = (key: string) => ((key in d) ? path(d[key]) : path(act[key.replace(/_url$/, "")]));
  const c = asDict(d.complaint ?? det.complaint);
  const complaint: OrderComplaint = {
    available: c.available === true || c.can_complain === true,
    deadlineAt: first(c.deadline_at, d.complaint_deadline_at, det.complaint_deadline_at),
    // After a rework the old complaint id stays while `submitted` is false again: the backend's flag wins over the id.
    submitted: typeof c.submitted === "boolean" ? c.submitted : !!asStr(c.complaint_id),
    id: first(c.active_complaint_id, c.complaint_id, c.id),
    url: path(c.url ?? d.complaint_url),
    status: asStr(c.status).toLowerCase(),
    resolution: asStr(c.resolution).toLowerCase(),
    resolutionNote: asStr(c.resolution_note).trim(),
    reworkRequired: c.rework_required === true,
    reworkDeadlineAt: first(c.rework_deadline_at),
    reworkIteration: num(c.rework_iteration) ?? 0,
  };
  const w = asDict(d.warranty ?? d.warranty_claim ?? det.warranty_claim);
  const fp = asDict(d.final_payment ?? det.final_payment);
  const finalId = first(d.final_payment_id, det.final_payment_id, fp.id);
  const finalAmount = uzs(d, "final_amount") || uzs(det, "final_amount") || uzs(fp, "amount");
  const pay = asDict(d.payment);
  return {
    contactUnlocked: bool(d.contact_unlocked),
    chatReadOnly: bool(d.chat_read_only, det.chat_read_only, chat.read_only),
    callsEnabled: bool(d.calls_enabled, det.calls_enabled, chat.calls_enabled),
    callTypes,
    canStart: d.can_start === true && !!url("start_url"),
    startUrl: url("start_url"),
    canComplete: d.can_complete === true || (d.can_complete === undefined && !!url("complete_url")),
    checklistUrl: url("checklist_url"),
    financialsUrl: path(d.financials_url),
    warrantyUrl: path(d.warranty_url),
    startedAt: first(d.started_at, det.started_at, det.work_started_at),
    expectedCompletedAt: first(d.expected_completed_at, det.expected_completed_at),
    completedAt: first(d.completed_at, det.completed_at),
    acceptanceDeadlineAt: first(d.acceptance_deadline_at, det.acceptance_deadline_at, d.confirmation_deadline_at, det.confirmation_deadline_at),
    complaint,
    warranty: Object.keys(w).length ? { status: asStr(w.status).toLowerCase() || "new", resolution: asStr(w.resolution ?? w.requested_resolution).toLowerCase(), reason: asStr(w.reason), decision: first(w.decision, w.resolution_note, w.call_center_note) } : null,
    advance: part(fin, "advance"),
    final: part(fin, "final"),
    finalPayment: finalId || finalAmount > 0 ? { id: finalId, amount: finalAmount, status: asStr(fp.status ?? d.final_payment_status).toLowerCase(), url: https(fp.payment_url ?? d.final_payment_url) } : null,
    payment: asStr(pay.id) ? { id: asStr(pay.id), amount: uzs(pay, "amount"), status: asStr(pay.status).toLowerCase(), url: https(pay.payment_url) } : null,
    checklistProgress: d.checklist_progress !== undefined || asDict(d.checklist).progress !== undefined ? progressOf(d.checklist_progress ?? asDict(d.checklist).progress) : null,
    pricing: normPricing(det.pricing_snapshot ?? d.pricing_snapshot),
    resolution: normResolution(d.resolution ?? det.resolution),
    workPhase: phaseWord(first(d.work_phase, det.work_phase)),
    review: normReview(d, det),
    duration: normDuration(d.duration ?? det.duration),
    clientStatusMessage: first(d.client_status_message, det.client_status_message),
    waitingReplacement: d.waiting_replacement_acceptance === true,
    canRequestCancellation: d.can_request_cancellation === true,
  };
}

const phaseWord = (s: string): FlowOrder["workPhase"] => (s.toLowerCase() === "reviewing" ? "reviewing" : s.toLowerCase() === "execution" ? "execution" : "");

// review_deadline_at / review_duration / review_*_note (TZ §6.3, §7): on the order once the work started with a review stage.
function normReview(d: Dict, det: Dict): OrderReview | null {
  const deadlineAt = first(d.review_deadline_at, det.review_deadline_at);
  const dur = asDict(d.review_duration ?? det.review_duration);
  if (!deadlineAt && !Object.keys(dur).length) return null;
  return {
    deadlineAt,
    completedAt: first(d.review_completed_at, det.review_completed_at),
    clientNote: first(d.review_client_note, det.review_client_note),
    sellerNote: first(d.review_seller_note, det.review_seller_note),
    value: num(dur.value),
    unit: asStr(dur.unit).toLowerCase(),
  };
}

// `duration`: { value, unit minute|hour|day, calendar calendar|business_days } — null until the delivery time is known.
export function normDuration(v: unknown): FlowDuration | null {
  const r = asDict(v);
  const value = num(r.value, r.duration_value);
  if (value === null || value <= 0) return null;
  return { value, unit: asStr(r.unit ?? r.duration_unit).toLowerCase() || "day", calendar: asStr(r.calendar ?? r.duration_calendar).toLowerCase() || "calendar" };
}

// details.pricing_snapshot: the components exactly as listed (order kept, nothing summed); null when there are none.
export function normPricing(v: unknown): PriceSnapshot | null {
  const p = asDict(v);
  const components: PriceComponent[] = asArr(p.components).map((x) => {
    const c = asDict(x);
    const ex = asDict(c.explanation);
    const explanation: PriceComponent["explanation"] = {};
    for (const k of ["uz", "ru", "en"] as const) if (asStr(ex[k]).trim()) explanation[k] = asStr(ex[k]).trim();
    return { code: asStr(c.code).toLowerCase(), optionId: asStr(c.option_id), amount: num(c.amount) ?? 0, explanation };
  }).filter((c) => c.code || Object.keys(c.explanation).length);
  if (!components.length) return null;
  return { currency: asStr(p.currency, "UZS").toUpperCase() || "UZS", components, finalPrice: num(p.final_price, p.selected_price) ?? 0, historical: p.historical_policy_exact === false };
}

const CHOICES: ResolutionChoice[] = ["reassign", "refund"];

// `resolution`: { can_choose, offer: { id, status, options, deadline_at, message, selected_choice } }; null when the order has none.
export function normResolution(v: unknown): OrderResolution | null {
  const r = asDict(v);
  if (!Object.keys(r).length) return null;
  const o = asDict(r.offer);
  const options = asArr(o.options).map((x) => asStr(x).toLowerCase()).filter((x): x is ResolutionChoice => (CHOICES as string[]).includes(x));
  return {
    canChoose: r.can_choose === true,
    offer: Object.keys(o).length ? { id: asStr(o.id), status: asStr(o.status).toLowerCase(), options, deadlineAt: asStr(o.deadline_at), message: asStr(o.message).trim(), selected: asStr(o.selected_choice).toLowerCase() } : null,
  };
}

// Backend payment stages ("marketplace_order", "marketplace_package_order", "marketplace_additional_payment", the advance / final of the
// split flow …) → what the row is, for its label only.
export function payKindOf(stage: string): PayKind {
  const s = stage.toLowerCase();
  if (/refund/.test(s)) return "refund";
  if (/additional|supplement/.test(s)) return "additional";
  if (/advance|prepay|deposit|upfront/.test(s)) return "advance";
  if (/final|balance|remaining|rest/.test(s)) return "final";
  if (/order|package|service|purchase/.test(s)) return "full";
  return "other";
}

export function normFinancials(v: unknown): Financials {
  const d = asDict(v);
  const snap = asDict(d.snapshot);
  const pay = asDict(snap.payment);
  const com = asDict(snap.commission);
  const payments: FinPayment[] = asArr(d.payments).map((x) => {
    const p = asDict(x);
    const stage = asStr(p.stage).toLowerCase();
    return { id: asStr(p.id), stage, kind: payKindOf(stage), status: asStr(p.status).toLowerCase() || "pending", amount: uzs(p, "amount"), paid: uzs(p, "paid_amount"), createdAt: asStr(p.created_at) };
  });
  const s = d.settlement;
  return {
    gross: uzs(snap, "gross_amount"),
    currency: asStr(snap.currency, "UZS") || "UZS",
    advance: part(pay, "advance"),
    final: part(pay, "final"),
    commission: Object.keys(com).length && (uzs(com, "platform_amount") > 0 || num(com.effective_percent) !== null) ? { percent: num(com.effective_percent), platform: uzs(com, "platform_amount"), net: uzs(com, "seller_net_amount") } : null,
    payments,
    settlement: typeof s === "string" ? s.toLowerCase() : asStr(asDict(s).status).toLowerCase(),
    historical: snap.historical_policy_exact === false,
  };
}

const statusOf = (v: unknown): CheckStatus => {
  const s = asStr(v).toLowerCase();
  return /^(done|completed?|finished)$/.test(s) ? "done" : /^skip/.test(s) ? "skipped_with_reason" : "pending";
};
const fileOf = (v: unknown): CheckFile => {
  if (typeof v === "string") return { id: v.trim(), name: "", url: "" };
  const f = asDict(v);
  return { id: first(f.id, f.file_id), name: first(f.name, f.file_name, f.filename), url: first(f.download_url, f.url) };
};

export function normCheckItem(v: unknown): CheckItem {
  const r = asDict(v);
  const required = r.required === true || r.is_required === true;
  const skip = r.skip_allowed ?? r.can_skip ?? r.allow_skip ?? r.skippable;
  const methods = Array.isArray(r.verification_methods);
  return {
    id: first(r.id, r.item_id, r.checklist_item_id, r.key, r.item_key),
    title: first(r.title, r.name, r.label, r.text, r.executor_title, r.client_title),
    clientTitle: first(r.client_title),
    description: first(r.description, r.hint),
    status: statusOf(r.status),
    required,
    commentRequired: r.comment_required === true,
    fileRequired: r.file_required === true,
    imageRequired: r.image_required === true,
    skipAllowed: typeof skip === "boolean" ? skip : methods || !required,
    comment: asStr(r.comment ?? r.reason ?? r.note),
    files: asArr(r.files ?? r.attachments).map(fileOf).filter((f) => f.id || f.url),
    images: asArr(r.images ?? r.image_files ?? r.photos).map(fileOf).filter((f) => f.id || f.url),
    updatedAt: first(r.updated_at, r.completed_at),
    sortOrder: asNum(r.sort_order ?? r.position),
  };
}

export function normChecklist(v: unknown, orderId = ""): Checklist {
  const r = asDict(v);
  const inner = asDict(r.checklist);
  const s = Object.keys(inner).length ? inner : r;
  const raw = [s.items, r.checklist, s.checklist_items].find(Array.isArray) as unknown[] | undefined;
  const items = (raw ?? []).map(normCheckItem).filter((i) => i.id || i.title).sort((a, b) => a.sortOrder - b.sortOrder);
  const up = asDict(s.file_upload ?? r.file_upload);
  const upUrl = typeof (s.file_upload ?? r.file_upload) === "string" ? asStr(s.file_upload ?? r.file_upload) : asStr(up.url ?? up.upload_url);
  return {
    orderId: first(s.order_id, r.order_id) || orderId,
    items,
    progress: progressOf(s.progress ?? r.progress, items, s),
    snapshotLocked: (s.snapshot_locked ?? r.snapshot_locked) === true, // the item list is frozen (at start); statuses still change
    uploadRoomId: ROOM_UPLOAD.exec(upUrl)?.[1] ?? "",
    phase: asStr(s.work_phase ?? r.work_phase).toLowerCase(),
  };
}

export function normCaps(v: unknown): RuntimeCaps {
  const d = asDict(v);
  const pay = asDict(d.payments);
  const asg = asDict(d.marketplace_assignment);
  const rc = asDict(d.rating_and_complaint);
  const w = asDict(d.warranty);
  const choices: WarrantyResolution[] = [];
  if (w.replacement === true) choices.push("replacement");
  if (w.full_refund === true) choices.push("full_refund");
  return {
    advancePercent: num(pay.advance_percent),
    finalPercent: num(pay.final_percent),
    providerEnabled: pay.provider_enabled === true,
    sellerResponseMinutes: num(asg.seller_response_minutes),
    ratingWindowMinutes: num(rc.window_minutes),
    lowRatingAutoComplaint: rc.low_rating_auto_complaint !== false,
    warrantyChoices: choices,
  };
}

// GET …/timeline: { items: [{ id, type, status, at, actor?, data: { status, note, … } }] } — for a status step the record's own `status`
// is "active" and the step is in data. The client's copy carries no operator-only fields (the backend strips them).
export function normTimeline(v: unknown): FlowEvent[] {
  return asArr(asDict(v).items).map((x) => {
    const r = asDict(x);
    const data = asDict(r.data ?? r.payload);
    const actor = asDict(r.actor ?? data.actor);
    return {
      id: asStr(r.id),
      type: asStr(r.type).toLowerCase() || "status",
      status: first(data.status, data.event, r.event, r.status).toLowerCase(),
      note: first(data.client_visible_reason, data.note, data.comment, data.reason, data.message),
      at: first(r.at, r.created_at),
      actor: first(actor.name, actor.full_name, data.actor_name),
      choice: first(data.choice, data.action, data.resolution, data.selected_choice).toLowerCase(),
    };
  }).filter((e) => e.status || e.note || e.type !== "status").sort((a, b) => (a.at < b.at ? -1 : 1));
}

// GET …/refund: { refund: { request_id, amount, currency, status, provider_mode, provider_enabled, updated_at }, provider_enabled }.
export function normRefund(v: unknown): OrderRefund | null {
  const d = asDict(v);
  const r = asDict(d.refund);
  if (!Object.keys(r).length) return null;
  const enabled = typeof r.provider_enabled === "boolean" ? r.provider_enabled : d.provider_enabled;
  return {
    requestId: first(r.request_id, r.id),
    amount: num(r.amount) ?? 0,
    currency: asStr(r.currency, "UZS").toUpperCase() || "UZS",
    status: asStr(r.status).toLowerCase() || "pending",
    manual: enabled === false || asStr(r.provider_mode).toLowerCase() === "manual",
    updatedAt: first(r.updated_at, r.created_at),
  };
}
