import type { MyDoc, UnlockPolicy } from "../model/docTypes";
import { DRAFT, PAY_WAIT, READY, STOPPED } from "./status";

export type DocCan = { edit: boolean; review: boolean; version: boolean; pay: boolean; payWait: boolean; stopped: boolean; advocate: boolean };

// What the client may do now. Every flag starts from a backend flag (can_send_lawyer_request,
// constructor_action.available, payment_*, status) — nothing is invented client-side (TZ 3.2/6.2).
// `reviewOff`: the platform switched the review mode off (document service settings, TZ.md §4), so no review is offered.
export function docCan(d: MyDoc, p?: UnlockPolicy, reviewOff = false): DocCan {
  const s = d.status.toLowerCase();
  const stopped = STOPPED.has(s);
  const fields = d.fields.length > 0;
  // A delivered or closed document is not edited again, whatever constructor_action says.
  const done = READY.has(s) || s === "closed";
  const payWait = d.paymentRequired || PAY_WAIT.has(s);
  return {
    edit: fields && !stopped && !done && (DRAFT.has(s) || d.ctor?.available === true),
    review: !reviewOff && d.canSend && !!d.templateId && !stopped && !payWait,
    version: fields && !stopped && (DRAFT.has(s) || READY.has(s)),
    pay: d.requiresPayment && !d.paid && !p?.paid && d.price > 0 && !payWait && !stopped,
    payWait,
    stopped,
    advocate: d.lawyerActive || d.mode === "lawyer" || !!d.lawyer,
  };
}
