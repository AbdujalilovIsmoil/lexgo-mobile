import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { AdditionalPay, OrderRating, OrderResult, PackSnap, QuoteSnap, ResultFile } from "../model/extraTypes";

const first = (...v: unknown[]): Dict => v.map(asDict).find((d) => Object.keys(d).length) ?? {};
const ids = (v: unknown): string[] => asArr(v).map((x) => asStr(asDict(x).id || x)).filter(Boolean);

// Quote snapshot: what the client was priced at (selected options + backend breakdown).
export function normQuoteSnap(d: Dict): QuoteSnap & { optionIds: string[] } {
  const det = asDict(d.details);
  const snap = first(d.quote_snapshot, det.quote_snapshot, det.option_quote, d.quote, det.quote);
  const q = Object.keys(asDict(snap.quote)).length ? asDict(snap.quote) : snap;
  const rows = asArr(q.breakdown ?? q.selected_options ?? d.selected_options ?? det.selected_options);
  const options = rows.map((v) => { const x = asDict(v); return { id: asStr(x.id), label: asStr(x.label ?? x.title), amount: uzs(x, "amount") }; }).filter((o) => o.id || o.label);
  const optionIds = ids(q.selected_option_ids ?? d.selected_option_ids ?? det.selected_option_ids);
  return { base: uzs(q, "base_price"), additional: uzs(q, "additional_amount"), total: uzs(q, "total_price"), options, optionIds: optionIds.length ? optionIds : options.map((o) => o.id).filter(Boolean) };
}

export function normPackSnap(d: Dict): PackSnap | null {
  const p = first(d.package_snapshot, asDict(d.details).package_snapshot);
  if (!Object.keys(p).length) return null;
  const tier = asDict(p.tier_snapshot ?? p.tier);
  return { id: asStr(p.package_id ?? p.id), title: asStr(p.title), tier: asStr(p.tier_code ?? tier.tier ?? p.tier).toUpperCase(), duration: asStr(tier.duration ?? p.duration), included: asArr(tier.included ?? p.included).map((x) => asStr(x)).filter(Boolean) };
}

const file = (v: unknown): ResultFile => { const x = asDict(v); return { fileId: asStr(x.file_id ?? x.id), fileName: asStr(x.file_name ?? x.name), downloadUrl: asStr(x.download_url ?? x.url) }; };

export function normResult(d: Dict): OrderResult {
  const det = asDict(d.details);
  const r = first(d.result, det.result);
  return { text: asStr(r.result_text ?? r.text ?? d.result_text ?? det.result_text).trim(), files: asArr(r.result_files ?? r.files ?? d.result_files ?? det.result_files).map(file), at: asStr(r.completed_at ?? d.completed_at ?? det.completed_at) };
}

const DAY = 24 * 3600 * 1000;

// Real payload: the request itself is not nested; the order carries details.additional_payment_request_id and its
// payment (target_type marketplace_additional_payment) holds the new quote, the options and the creation time (valid 24 h).
function fromPayment(d: Dict): AdditionalPay | null {
  const det = asDict(d.details);
  const pay = asDict(d.payment);
  if (asStr(pay.target_type) !== "marketplace_additional_payment" && !asStr(det.additional_payment_request_id)) return null;
  const pp = asDict(pay.provider_payload);
  const q = asDict(pp.option_quote);
  const at = asStr(pay.created_at);
  const end = Date.parse(at) + DAY;
  return { id: asStr(det.additional_payment_request_id), status: asStr(pay.status, "pending").toLowerCase(), total: uzs(q, "total_price"), note: asStr(pp.note).trim(), optionIds: ids(pp.selected_option_ids), requestedAt: at, expiresAt: Number.isFinite(end) ? new Date(end).toISOString() : "" };
}

export function normAdditional(d: Dict): AdditionalPay | null {
  const a = first(d.additional_payment, d.additional_payment_request, d.supplemental_payment, asDict(d.details).additional_payment);
  if (!Object.keys(a).length) return fromPayment(d);
  return { id: asStr(a.id ?? a.request_id), status: asStr(a.status).toLowerCase(), total: uzs(a, "new_total", "total_price", "amount"), note: asStr(a.note).trim(), optionIds: ids(a.selected_option_ids), requestedAt: asStr(a.created_at ?? a.requested_at), expiresAt: asStr(a.expires_at ?? a.deadline_at ?? a.valid_until) };
}

// rating: { available, closed, reason, deadline_at, remaining_seconds } plus the given value once the client rated.
export function normRating(d: Dict): OrderRating {
  const r = asDict(d.rating);
  const det = asDict(d.details);
  const given = asDict(r.value ?? r.given ?? r.review);
  const stars = typeof r.value === "number" ? r.value : typeof det.rating === "number" ? det.rating : asNum(given.rating ?? r.score ?? r.stars);
  return { available: r.available === true, closed: r.closed === true, reason: asStr(r.reason), deadlineAt: asStr(r.deadline_at), remainingSeconds: asNum(r.remaining_seconds), stars, comment: asStr(given.comment ?? r.comment ?? det.rating_comment), fetchedAt: Date.now() };
}
