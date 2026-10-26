import { routesMore } from "./routesMore";
import { enc, str, type Subject, type Target, type Viewer } from "./types";

const tg = (href: string, fallback: string, label: string, probe?: Target["probe"]): Target => ({ href, fallback, label, probe });
const CALL_OVER = ["ended", "cancelled", "canceled", "declined", "missed", "expired", "failed", "rejected"];

// Subject + viewer → where it opens. null = nothing sensible to open (the notification just stays
// readable). Paths are the contract table of TZ_GUIDE.md section 3; every list is the safe fallback.
export function routeFor(s: Subject, v: Viewer): Target | null {
  const id = enc(s.id);
  const room = str(s.data.room_id) || (s.kind === "chat" ? s.id : "");
  switch (s.kind) {
    case "chat":
      return room ? tg(`/chat/${enc(room)}`, "/(tabs)/messages", "chat", { path: `/secure-chats/${enc(room)}` }) : tg("/(tabs)/messages", "/(tabs)/messages", "chat");
    case "call": {
      const call = str(s.data.call_id);
      if (!room) return tg("/(tabs)/messages", "/(tabs)/messages", "chat");
      // A call that already ended is useless to open: the chat of the same room is the safe place.
      return call ? tg(`/call/${enc(room)}?callId=${enc(call)}`, `/chat/${enc(room)}`, "call", { path: `/secure-chats/${enc(room)}/calls/${enc(call)}`, closed: CALL_OVER }) : tg(`/chat/${enc(room)}`, "/(tabs)/messages", "chat");
    }
    case "ticket":
      return id ? tg(`/support/${id}`, "/support", "ticket", { path: `/support/tickets/${id}` }) : tg("/support", "/support", "ticket");
    case "urgent": {
      const base = v.kind === "seller" ? "/pro/urgent" : "/urgent";
      return tg(id ? `${base}/${id}` : base, base, "urgent", id && v.kind === "client" ? { path: `/urgent-advokat/requests/${id}` } : undefined);
    }
    case "complaint": {
      if (v.kind === "seller") return null;
      return str(s.data.work_id) ? tg(`/rate/${enc(str(s.data.work_id))}`, "/(tabs)/works", "complaint") : tg("/(tabs)/works", "/(tabs)/works", "complaint");
    }
    default:
      return routesMore(s, v);
  }
}
