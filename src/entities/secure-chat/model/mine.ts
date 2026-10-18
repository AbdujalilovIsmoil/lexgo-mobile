import type { Room } from "./types";

/** Rooms where I am one of the people (staff also get everybody else's rooms from the server). */
export const isMyRoom = (r: Room, myId: string): boolean => !myId || r.clientId === myId || r.sellerId === myId || r.members.some((m) => m.userId === myId);

export const myRooms = (rooms: Room[], myId: string): Room[] => rooms.filter((r) => isMyRoom(r, myId));

/** Total unread counter of the tab badge. */
export const unreadTotal = (rooms: Room[], myId: string): number => myRooms(rooms, myId).reduce((n, r) => n + (r.status === "archived" ? 0 : r.unread), 0);

/** Newest conversation first. */
export const byActivity = (a: Room, b: Room): number => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0);
