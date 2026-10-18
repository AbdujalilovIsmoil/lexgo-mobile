import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { ConsentDoc, ConsentItem } from "./types";

// /legal/consents/me rows are { consent: {...}, accepted, requires_reaccept, accepted_at }.
function norm(v: unknown): ConsentItem {
  const d = asDict(v);
  const c = asDict(d.consent);
  const pick = (k: string) => (d[k] === undefined ? c[k] : d[k]);
  const json = asDict(c.title_json ?? d.title_json);
  return {
    id: asStr(pick("consent_id") ?? pick("id")),
    slug: asStr(pick("slug")),
    version: asStr(pick("version")),
    title: asStr(pick("title")),
    titleRu: asStr(json.ru),
    accepted: d.accepted !== false,
    requiresReaccept: Boolean(d.requires_reaccept),
    acceptedAt: asStr(d.accepted_at),
  };
}

export const listConsents = async (): Promise<ConsentItem[]> => asArr(await http("/legal/consents/me")).map(norm).filter((c) => c.id);

// GET /legal/consents/{id} — the full text (the list is a light summary).
export async function getConsent(id: string): Promise<ConsentDoc> {
  const d = asDict(await http(`/legal/consents/${encodeURIComponent(id)}`));
  const json = asDict(d.title_json);
  return { id: asStr(d.id), slug: asStr(d.slug), version: asStr(d.version), title: asStr(d.title), titleRu: asStr(json.ru), accepted: true, requiresReaccept: false, acceptedAt: "", body: asStr(d.body ?? d.content) };
}

// POST /legal/consents/{id}/accept — there is no withdraw endpoint on the backend.
export const acceptConsent = async (id: string, version: string): Promise<void> => void (await http(`/legal/consents/${encodeURIComponent(id)}/accept`, { method: "POST", body: version ? { version } : {} }));
