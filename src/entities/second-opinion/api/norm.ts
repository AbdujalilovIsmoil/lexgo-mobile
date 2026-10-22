import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { Placement, Promotion, SoChannel, SoOptions, SoQuote } from "../model/types";

const strings = (v: unknown): string[] => asArr(v).map((x) => asStr(x).trim()).filter(Boolean);
const placementOf = (v: unknown): Placement => (asStr(v) === "completed" ? "completed" : "in_progress");
const channelOf = (v: unknown): SoChannel | "" => (asStr(v) === "video" ? "video" : asStr(v) === "chat" ? "chat" : "");
const num = (v: unknown, d: number): number => { const n = Number(v); return Number.isFinite(n) ? n : d; };

// The promotion is shown only when the backend says `visible`; its texts are the backend's (never hardcoded here).
export function normPromotion(v: unknown): Promotion {
  const d = asDict(v);
  return {
    visible: d.visible === true,
    orderId: asStr(d.order_id),
    placement: placementOf(d.placement),
    title: asStr(d.title).trim(),
    description: asStr(d.description).trim(),
    benefits: strings(d.benefits),
    dismissible: d.dismissible === true,
    dismissedForSession: d.dismissed_for_session === true,
    priceVisible: d.price_visible === true,
    ctaLabel: asStr(d.cta_label).trim(),
    optionsUrl: asStr(d.options_url),
    quoteUrl: asStr(d.quote_url),
    eventUrl: asStr(d.event_url),
  };
}

export function normOptions(v: unknown): SoOptions {
  const d = asDict(v);
  const count = asDict(d.lawyer_count);
  const min = Math.max(1, Math.round(num(count.minimum, 2)));
  const max = Math.max(min, Math.round(num(count.maximum, 7)));
  const channels = asArr(d.channels).flatMap((c) => { const x = asDict(c); const value = channelOf(x.value); return value ? [{ value, label: asStr(x.label).trim() }] : []; });
  return {
    orderId: asStr(d.order_id),
    serviceTitle: asStr(d.service_title).trim(),
    channels,
    minCount: min,
    maxCount: max,
    defaultCount: Math.min(max, Math.max(min, Math.round(num(count.default, min)))),
    directionSuggestions: strings(d.direction_suggestions),
    quoteUrl: asStr(d.quote_url),
  };
}

export function normQuote(v: unknown): SoQuote {
  const d = asDict(v);
  return {
    channel: channelOf(d.channel) || "video",
    count: Math.round(num(d.lawyer_count, 0)),
    directions: strings(d.directions),
    amount: num(d.amount, 0),
    currency: asStr(d.currency, "UZS") || "UZS",
    priceVisible: d.price_visible === true,
    selectionComplete: d.selection_complete === true,
    requestUrl: asStr(d.request_url),
    requestPayload: asDict(d.request_payload),
  };
}

// POST /urgent-advokat/requests answers with the record (or wraps it as `urgent_request`): its id and work number.
export function normCreated(v: unknown): { id: string; workId: string } {
  const d = asDict(v);
  const r = asDict(d.urgent_request && !d.id ? d.urgent_request : d);
  return { id: asStr(r.id ?? r.request_id), workId: asStr(r.work_id ?? r.workId) };
}
