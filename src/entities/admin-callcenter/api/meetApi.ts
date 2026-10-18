import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

const digits = (s: string) => s.replace(/\D/g, "");

// A lead often carries only a phone: resolve it to a platform user (staff /users/search) by digits.
export async function findUserByPhone(phone: string): Promise<string> {
  const d = digits(phone);
  if (d.length < 7) return "";
  const rows = listFrom(await http(`/users/search?${new URLSearchParams({ q: d.length > 9 ? `+${d}` : d, limit: "20" })}`), "items", "data", "users").map(asDict);
  const hit = rows.find((u) => digits(asStr(u.phone)) === d) ?? rows.find((u) => digits(asStr(u.phone)).endsWith(d.slice(-9)));
  return asStr(hit?.id);
}

// Opens a secure-chat room with the client (staff pay nothing) and starts a titled video meeting with them invited.
export async function startClientMeeting(clientUserId: string, title: string): Promise<{ roomId: string; callId: string }> {
  const room = asDict(await http("/secure-chats", { method: "POST", body: { client_user_id: clientUserId } }));
  const roomId = asStr(room.id);
  const call = asDict(await http(`/secure-chats/${roomId}/calls`, { method: "POST", body: { call_type: "video", title, participant_user_ids: [clientUserId], max_duration_minutes: 60 } }));
  return { roomId, callId: asStr(call.id) };
}
