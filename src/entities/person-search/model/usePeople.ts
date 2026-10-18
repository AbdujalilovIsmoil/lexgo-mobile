import { useQuery } from "@tanstack/react-query";
import { ApiError, http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

export type Person = { id: string; name: string; phone: string; lexgoId: string; role: string };
const person = (id: string, name: string, phone: string, lexgoId: string, role: string): Person => ({ id, name, phone, lexgoId, role });

// GET /users/search?q= — staff only (everyone else gets 403 and falls back to the directory below).
async function staffSearch(q: string): Promise<Person[]> {
  return listFrom(await http(`/users/search?${new URLSearchParams({ q, limit: "20" })}`), "items", "data", "users").map((v) => {
    const d = asDict(v);
    return person(asStr(d.id), asStr(d.name), asStr(d.phone), asStr(d.lexgo_id), asStr(d.role, "client"));
  });
}

// What a non-staff account may reach: the public lawyers directory (+ a professional's own clients).
async function directory(): Promise<Person[]> {
  const [lawyers, clients] = await Promise.all([
    http("/lawyers").then((d) => listFrom(d, "lawyers", "items", "data")).catch(() => []),
    http("/lawyers/me/clients").then((d) => listFrom(d, "items", "data")).catch(() => []),
  ]);
  const out = new Map<string, Person>();
  for (const v of lawyers) {
    const d = asDict(v);
    if (asStr(d.user_id)) out.set(asStr(d.user_id), person(asStr(d.user_id), asStr(d.lawyer_name), "", asStr(d.public_id), asStr(d.seller_type, "lawyer")));
  }
  for (const v of clients) {
    const d = asDict(v);
    if (asStr(d.id)) out.set(asStr(d.id), person(asStr(d.id), asStr(d.name), asStr(d.phone), "", "client"));
  }
  return [...out.values()];
}

const match = (u: Person, q: string) => `${u.name} ${u.phone} ${u.lexgoId}`.toLowerCase().includes(q.toLowerCase());

/** People search for "new chat", "invite", "transfer": staff search everybody, others the directory (filtered on the phone). */
export function usePeople(q: string, me: string, enabled = true) {
  const query = q.trim();
  return useQuery({
    queryKey: ["person-search", query],
    enabled,
    queryFn: async (): Promise<Person[]> => {
      let found: Person[] | null = null;
      if (query.length >= 2) found = await staffSearch(query).catch((e) => { if (e instanceof ApiError && [401, 403, 404].includes(e.status)) return null; throw e; });
      return (found ?? (await directory()).filter((u) => !query || match(u, query))).filter((u) => u.id && u.id !== me).slice(0, 40);
    },
    staleTime: 60_000,
  });
}
