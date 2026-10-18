import { http, isForbidden } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { ClientCard } from "../model/clientTypes";
import type { CcClient } from "../model/types";
import { normClientCard } from "./clientCardNorm";
import { normClient } from "./clientNorm";

// A LexGo public id ("LGC-35684894"): the call-center search matches names and phones only.
export const looksLikeLexgoId = (q: string): boolean => /^LG[A-Z]{0,3}-?\d{4,}$/i.test(q.trim());

// GET /call-center/clients/search?q= — name or phone, from 2 characters. A public id the search does not know is
// looked up in the admin directory instead (users.manage); a refusal there just means "no result".
export async function searchClients(q: string): Promise<CcClient[]> {
  const rows = listFrom(await http(`/call-center/clients/search?q=${encodeURIComponent(q)}`), "items", "data").map(normClient);
  if (rows.length || !looksLikeLexgoId(q)) return rows;
  try {
    return listFrom(await http(`/admin/users?q=${encodeURIComponent(q.trim())}`), "items", "data", "users").map(normClient).filter((c) => c.id);
  } catch {
    return [];
  }
}

// GET /call-center/clients/{id}; call-center roles without lookup rights fall back to the admin 360 view (403 there too → thrown).
export async function getClientCard(id: string): Promise<ClientCard> {
  const key = encodeURIComponent(id);
  try {
    return normClientCard(await http(`/call-center/clients/${key}`));
  } catch (e) {
    if (!isForbidden(e)) throw e;
    return normClientCard(await http(`/admin/clients/${key}/360`));
  }
}
