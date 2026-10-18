import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { UserEvent } from "@/shared/realtime";
import { normLast, normRoom } from "../api/normalizeRoom";
import { activeRoom } from "./active";
import type { Room } from "./types";

// Folds a user-socket event into the cached room list: a new message moves its room to the top with a fresh
// preview and unread count (taken from the event's room snapshot when it has one); my own `secure_chat.read`
// clears the badge. Returns null when the list must be refetched (a room we do not know yet).
export function applyRoomEvent(rooms: Room[], e: UserEvent, myId: string): Room[] | null {
  const id = asStr(e.room_id);
  if (!id) return rooms;
  if (e.event === "secure_chat.read") return asStr(e.user_id) === myId ? rooms.map((r) => (r.id === id ? { ...r, unread: asNum(e.unread_count) } : r)) : rooms;
  if (e.event !== "secure_chat.message_created") return rooms;
  const cur = rooms.find((r) => r.id === id);
  const last = normLast(e.message);
  if (!cur || !last) return null;
  const snap = asDict(e.room);
  const mine = last.senderId === myId;
  const unread = id === activeRoom() ? 0 : "unread_count" in snap ? normRoom({ ...snap, id }).unread : mine ? cur.unread : cur.unread + 1;
  return [{ ...cur, last: { ...last, mine }, updatedAt: last.createdAt || cur.updatedAt, unread }, ...rooms.filter((r) => r.id !== id)];
}
