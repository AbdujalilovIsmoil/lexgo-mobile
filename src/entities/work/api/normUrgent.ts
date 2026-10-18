import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Work } from "../model/types";
import { urgentEvents } from "./normEvents";
import { normUrgentFiles } from "./normFiles";
import { normRating } from "./normRating";
import type { Part } from "./normDoc";

// urgent_advokat: summary, urgent_request (payload, chat, actions, rating, lifecycle).
export function normUrgent(w: Work, d: Record<string, unknown>): Part {
  const u = asDict(d.urgent_request);
  const p = asDict(u.payload);
  const chat = asDict(u.chat);
  const minutes = asNum(p.meeting_minutes);
  return {
    roomId: chat.available === false ? "" : asStr(chat.room_id) || asStr(p.secure_chat_room_id),
    callId: "",
    payment: uzs(u, "price") > 0 ? { amount: uzs(u, "price"), currency: asStr(u.currency) || "UZS", status: "", paid: false, required: false } : null,
    timeline: urgentEvents(w, p.status_history, asStr(p.status_note)),
    files: [...normUrgentFiles(p.files), ...normUrgentFiles(p.voice_messages)],
    rating: normRating(u.rating),
    complaints: [],
    related: { kind: "urgent", id: asStr(u.id) || w.id },
    info: { need: asStr(p.need), channel: asStr(p.channel), region: asStr(p.region), minutes: minutes ? String(minutes) : "", result: asStr(p.result_summary), statusNote: asStr(p.status_note) },
  };
}
