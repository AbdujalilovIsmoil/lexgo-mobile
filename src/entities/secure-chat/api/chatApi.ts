import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Msg, Room } from "../model/types";
import { normMsg } from "./normalize";
import { normRoom } from "./normalizeRoom";

export const roomPath = (roomId: string, tail = "") => `/secure-chats/${encodeURIComponent(roomId)}${tail}`;

// GET /secure-chats — every room the account can see (staff see all of them); no paging on the server.
export async function listRooms(): Promise<Room[]> {
  return listFrom(await http("/secure-chats"), "rooms", "items", "data").map(normRoom);
}

// GET /secure-chats/{id} — one room with its participants.
export const getRoom = async (roomId: string): Promise<Room> => normRoom(await http(roomPath(roomId)));

// POST /secure-chats {client_user_id, seller_user_id} — staff and professionals open a room with anybody.
export async function createRoom(clientId: string, sellerId: string): Promise<Room> {
  return normRoom(await http("/secure-chats", { method: "POST", body: { client_user_id: clientId, seller_user_id: sellerId } }));
}

// GET /lawyers/{user_id}/private-chat — a client's chat with a professional (402 until the private-chat fee is paid).
export async function openPrivateChat(lawyerUserId: string): Promise<Room> {
  return normRoom(await http(`/lawyers/${encodeURIComponent(lawyerUserId)}/private-chat`));
}

// GET …/messages — the whole history (the server ignores paging); the call also marks the room as read.
export async function getMessages(roomId: string): Promise<Msg[]> {
  return listFrom(await http(roomPath(roomId, "/messages")), "messages", "items", "data").map(normMsg);
}

export async function sendMessage(roomId: string, content: string, replyToId = ""): Promise<Msg> {
  const meta = replyToId ? { reply_to_message_id: replyToId } : {};
  return normMsg(await http(roomPath(roomId, "/messages"), { method: "POST", body: { message_type: "text", content, meta } }));
}

// PATCH …/settings — messages vanish after N hours (0 = never); the backend keeps a 30-day archive.
export async function setRoomTtl(roomId: string, hours: number): Promise<void> {
  await http(roomPath(roomId, "/settings"), { method: "PATCH", body: { auto_delete_hours: hours } });
}

// DELETE — archives the chat (recoverable for about a month).
export async function deleteRoom(roomId: string): Promise<void> {
  await http(roomPath(roomId), { method: "DELETE" });
}

// POST /urgent-advokat/requests/{id}/chat/complete {summary} — closes a Tezkor Advokat chat (advocate / operator only).
export async function completeUrgentChat(recordId: string, summary: string): Promise<string> {
  const d = asDict(await http(`/urgent-advokat/requests/${encodeURIComponent(recordId)}/chat/complete`, { method: "POST", body: { summary } }));
  return asStr(d.status);
}
