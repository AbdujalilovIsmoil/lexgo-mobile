import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

const DEAD = new Set(["archived", "deleted", "closed"]);

// The secure room between the signed-in staff member (as the room's "seller" side) and a client: the newest live one
// in GET /secure-chats, else a new one (POST creates a fresh room on every call, so it must not be repeated).
export async function openClientRoom(clientUserId: string, meId: string): Promise<string> {
  const rooms = listFrom(await http("/secure-chats"), "rooms", "items", "data").map(asDict);
  const found = rooms.filter((r) => asStr(r.client_user_id) === clientUserId && asStr(r.seller_user_id) === meId && !DEAD.has(asStr(r.status)));
  const newest = found.sort((a, b) => asStr(b.updated_at ?? b.created_at).localeCompare(asStr(a.updated_at ?? a.created_at)))[0];
  if (newest) return asStr(newest.id);
  return asStr(asDict(await http("/secure-chats", { method: "POST", body: { client_user_id: clientUserId, seller_user_id: meId } })).id);
}
