import type { Href } from "expo-router";

// The chat / call room route built by the chat module. `join` opens the running call, `ua` / `wid`
// carry the urgent request so the room can offer "end chat" to staff.
export function chatHref(roomId: string, o: { join?: string; ua?: string; wid?: string } = {}): Href {
  const qs = new URLSearchParams();
  if (o.join) qs.set("join", o.join);
  if (o.ua) qs.set("ua", o.ua);
  if (o.wid) qs.set("wid", o.wid);
  return `/chat/${encodeURIComponent(roomId)}${qs.size ? `?${qs}` : ""}` as Href;
}
