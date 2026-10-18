import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

const digits = (s: string) => s.replace(/\D/g, "");

// GET /users/search — the platform user behind a phone (exact digits, else the last 9).
export async function findUserByPhone(phone: string): Promise<string> {
  const d = digits(phone);
  if (d.length < 7) return "";
  const q = new URLSearchParams({ q: d.length > 9 ? `+${d}` : d, limit: "20" });
  const users = listFrom(await http(`/users/search?${q}`), "items", "data", "users").map((u) => ({ id: asStr(asDict(u).id), phone: digits(asStr(asDict(u).phone)) }));
  return (users.find((u) => u.phone === d) ?? users.find((u) => u.phone.endsWith(d.slice(-9))))?.id ?? "";
}

// POST /secure-chats + POST /secure-chats/{id}/calls — a titled video meeting with the client invited.
export async function createMeeting(clientUserId: string, title: string): Promise<{ roomId: string; callId: string }> {
  const room = asDict(await http("/secure-chats", { method: "POST", body: { client_user_id: clientUserId } }));
  const body = { call_type: "video", title, participant_user_ids: [clientUserId], max_duration_minutes: 60 };
  const call = asDict(await http(`/secure-chats/${asStr(room.id)}/calls`, { method: "POST", body }));
  return { roomId: asStr(room.id), callId: asStr(call.id) };
}
