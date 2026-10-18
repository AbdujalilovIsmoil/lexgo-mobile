import type { Member, Room } from "./types";

export type RoomKind = "urgent" | "doc" | "order" | "case" | "other";
export const roomKind = (r: Room): RoomKind => (r.urgent ? "urgent" : r.docIds.length ? "doc" : r.orderId ? "order" : r.caseId ? "case" : "other");

/** The people in the room other than me (falls back to everybody for a room with only me in it). */
export function otherMembers(room: Room, myId: string): Member[] {
  const others = room.members.filter((m) => m.userId !== myId);
  return others.length ? others : room.members;
}

/** "Name", "Name, Name" or "Name +2" — what the room is called in lists and in its header. */
export function roomTitle(room: Room, myId: string): string {
  const names = otherMembers(room, myId).map((m) => m.name).filter(Boolean); // never the phone: TZ 40, numbers stay hidden
  if (names.length) return names.length > 2 ? `${names[0]}, ${names[1]} +${names.length - 2}` : names.join(", ");
  return room.last && !room.last.mine ? room.last.senderName : "";
}

/** The one person a 1:1 room is with (null for groups) — drives the avatar and the role chip. */
export const peerOf = (room: Room, myId: string): Member | null => (room.memberCount > 2 ? null : (otherMembers(room, myId)[0] ?? null));

/** A finished consultation / archived chat takes no new messages. */
export const isClosed = (room: Room | undefined): boolean => !!room && (room.status === "archived" || room.status === "completed");
