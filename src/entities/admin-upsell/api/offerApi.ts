import { http } from "@/shared/api";
import { asNum, asStr, listFrom } from "@/shared/lib/json";
import { normRecord } from "@/shared/lib/adm/record";
import type { Offer, OfferInput } from "../model/types";

const norm = (v: unknown): Offer => {
  const r = normRecord(v);
  const p = r.payload;
  return {
    id: r.id, workId: r.workId, title: r.title, status: r.status, price: r.price, clientId: asStr(p.client_user_id) || r.ownerId, planId: asStr(p.plan_id), serviceId: asStr(p.service_id),
    reason: asStr(p.reason), validUntil: asStr(p.valid_until), redemptions: asNum(p.redemption_count), createdAt: r.createdAt,
  };
};

// GET /upsell/offers — the personal offers of every client.
export const listOffers = async () => listFrom(await http("/upsell/offers"), "items", "data").map(norm).filter((o) => o.id);

// POST /upsell/offers — a personal offer for one client (the client buys it with POST …/purchase; the API has no update / delete).
export const createOffer = async (i: OfferInput) =>
  norm(await http("/upsell/offers", { method: "POST", body: {
    client_user_id: i.clientId, title: i.title, price: i.price, reason: i.reason,
    ...(i.planId ? { plan_id: i.planId } : {}), ...(i.validUntil ? { valid_until: `${i.validUntil}T23:59:59+05:00` } : {}),
  } }));
