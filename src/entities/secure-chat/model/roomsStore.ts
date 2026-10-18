import { registerSessionReset } from "@/shared/lib/sessionReset";
import { readJson, writeJson } from "@/shared/lib/storage";
import type { Room } from "./types";

// TZ 38: the chat list and the last message are cached so the inbox paints at once on a cold start
// (and offline); the network answer replaces it. Wiped on logout / role change.
const KEY = "msg_rooms_cache";
const KEEP = 60;

export const loadRooms = (userId: string): Promise<Room[] | null> => readJson<{ u: string; rooms: Room[] }>(KEY).then((c) => (c && c.u === userId ? c.rooms : null));
export const saveRooms = (userId: string, rooms: Room[]): Promise<void> => writeJson(KEY, { u: userId, rooms: rooms.slice(0, KEEP) });
registerSessionReset(() => void writeJson(KEY, null));
