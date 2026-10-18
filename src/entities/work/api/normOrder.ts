import { asDict, asStr, uzs } from "@/shared/lib/json";
import type { Work } from "../model/types";
import { orderEvents } from "./normEvents";
import type { Part } from "./normDoc";

// service_order: summary, order (details), status_history.
export function normOrder(w: Work, d: Record<string, unknown>): Part {
  const o = asDict(d.order);
  const det = asDict(o.details);
  const pay = asStr(o.payment_status).toLowerCase();
  const open = !["cancelled", "declined", "rejected", "lost"].includes(w.status);
  return {
    roomId: asStr(det.secure_chat_room_id),
    callId: "",
    payment: uzs(o, "price") > 0 ? { amount: uzs(o, "price"), currency: asStr(o.currency) || "UZS", status: pay, paid: pay === "paid", required: open && !!pay && pay !== "paid" } : null,
    timeline: orderEvents(w, d.status_history),
    files: [],
    rating: null,
    complaints: [],
    related: { kind: "order", id: asStr(o.id) || w.id },
    info: { service: asStr(o.service_title) || asStr(det.service_title), channel: asStr(det.preferred_channel), preferredTime: asStr(det.preferred_time), need: asStr(det.client_note) },
  };
}
