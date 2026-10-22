import { http, ApiError } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { eventKey, quoteKey } from "../lib/keys";
import { soErrorKind } from "../lib/errors";
import { promotionSessionId } from "../lib/session";
import type { Placement, PromoEventName, Promotion, SoChannel, SoOptions, SoQuote, SoCreated } from "../model/types";
import { normCreated, normOptions, normPromotion, normQuote } from "./norm";

const bare = (url: string): string => url.split("?")[0];

// GET …/second-opinion-promotion?placement=auto&session_id=… — `auto` lets the backend pick the placement from the order's status.
// A forced placement that does not match (409 second_opinion_placement_mismatch) is retried once with `auto`.
export async function fetchPromotion(url: string, placement: Placement | "auto" = "auto"): Promise<Promotion> {
  const get = (p: string) => http(`${bare(url)}?placement=${p}&session_id=${encodeURIComponent(promotionSessionId())}`);
  try {
    return normPromotion(await get(placement));
  } catch (e) {
    if (placement !== "auto" && soErrorKind(e) === "placement_mismatch") return normPromotion(await get("auto"));
    throw e;
  }
}

// POST …/second-opinion-promotion/events. Analytics never break the screen: a failure is reported to the caller as `false`.
export async function postPromoEvent(p: { eventUrl: string; orderId: string; placement: Placement }, event: PromoEventName, metadata: Record<string, unknown>): Promise<boolean> {
  const session = promotionSessionId();
  try {
    await http(p.eventUrl, { method: "POST", body: { event, placement: p.placement, session_id: session, idempotency_key: eventKey(p.orderId, p.placement, session, event), metadata } });
    return true;
  } catch {
    return false;
  }
}

// GET …/second-opinion/options — no price here.
export const fetchOptions = async (url: string): Promise<SoOptions> => normOptions(await http(url));

// POST …/second-opinion/quote — only after every selection is made; the first place a price may appear.
export async function requestQuote(url: string, o: { orderId: string; channel: SoChannel; count: number; directions: string[] }): Promise<SoQuote> {
  const session = promotionSessionId();
  const body = { channel: o.channel, lawyer_count: o.count, directions: o.directions, session_id: session, idempotency_key: quoteKey(o.orderId, session, o.channel, o.count) };
  return normQuote(await http(url, { method: "POST", body }));
}

// POST {request_url} with the quote's `request_payload` unchanged; only the client's own input (the need) is added.
export async function createSecondOpinion(requestUrl: string, payload: Record<string, unknown>, need: string): Promise<SoCreated> {
  const body: Record<string, unknown> = { ...payload, files: [], voice_messages: [] };
  if (need.trim()) body.need = need.trim();
  return normCreated(asDict(await http(requestUrl, { method: "POST", body })));
}

export { ApiError };
