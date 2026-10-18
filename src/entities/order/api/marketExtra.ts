import { normQuote } from "@/entities/price-option/api/priceOptionApi";
import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { OrderAddPay, OrderRating, PackageSnap, ResultFile } from "../model/marketTypes";

export function normOrderRating(v: unknown, at: number): OrderRating | null {
  const d = asDict(v);
  if (d.available === undefined && d.deadline_at === undefined) return null;
  return { available: d.available === true, closed: d.closed === true, reason: asStr(d.reason), deadlineAt: asStr(d.deadline_at), remainingSeconds: asNum(d.remaining_seconds), fetchedAt: at };
}

// `result_files` are {name,url} (or {file_name,download_url, file_id}); the path is what the authed download takes.
export function normResultFiles(v: unknown): ResultFile[] {
  return asArr(v).map((x) => {
    const d = asDict(x);
    return { name: asStr(d.name ?? d.file_name, "file"), path: asStr(d.url ?? d.download_url), id: asStr(d.file_id) };
  }).filter((f) => f.path);
}

export function normPackSnap(v: unknown): PackageSnap | null {
  const d = asDict(v);
  if (!asStr(d.title)) return null;
  const terms = asDict(d.terms);
  const str = (a: unknown) => asArr(a).map((x) => asStr(x)).filter(Boolean);
  return {
    title: asStr(d.title), code: asStr(d.package_code), price: uzs(d, "price"), components: asArr(d.components).length,
    customItems: asArr(d.custom_items).map((x) => ({ title: asStr(asDict(x).title), description: asStr(asDict(x).description), required: asDict(x).required === true })),
    included: str(terms.included), excluded: str(terms.excluded),
  };
}

const DAY = 24 * 3600 * 1000;

// The supplemental payment: the order's payment of kind marketplace_additional_payment (valid 24 h from its creation).
export function normAddPay(d: Dict, details: Dict): OrderAddPay | null {
  const pay = asDict(d.payment);
  const id = asStr(details.additional_payment_request_id);
  if (!id && asStr(pay.target_type) !== "marketplace_additional_payment") return null;
  const end = Date.parse(asStr(pay.created_at)) + DAY;
  return { id, status: asStr(pay.status, "pending").toLowerCase(), amount: uzs(pay, "amount"), total: uzs(asDict(asDict(pay.provider_payload).option_quote), "total_price"), expiresAt: Number.isFinite(end) ? new Date(end).toISOString() : "" };
}

// Everything the order detail adds on top of the list row: quote snapshot, package, result and the rating window.
export function normOrderExtra(d: Dict, details: Dict, at = Date.now()) {
  const quote = asDict(details.option_quote).total_price !== undefined ? normQuote({ quote: details.option_quote }) : null;
  return {
    quote,
    pack: normPackSnap(details.package_snapshot),
    resultText: asStr(d.result_text ?? details.result_text).trim(),
    resultFiles: normResultFiles(d.result_files ?? details.result_files),
    rating: normOrderRating(d.rating, at),
    ratingUrl: asStr(d.rating_url),
    ratingSubmitted: details.rating_submitted === true,
    ratingStars: typeof details.rating === "number" ? details.rating : 0,
    ratingComment: asStr(details.rating_comment).trim(),
    addPay: normAddPay(d, details),
  };
}
