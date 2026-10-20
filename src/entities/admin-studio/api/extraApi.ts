import { File } from "expo-file-system";
import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { downloadAndShare } from "@/shared/lib/files";
import { first, listOf } from "../lib/norm";
import { normComment } from "../lib/normObject";
import { enc, qs } from "../lib/qs";
import type { StudioComment } from "../model/types";
import type { StudioHeartbeat, StudioRef } from "../model/typesAdmin";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const stamp = () => new Date().toISOString().slice(0, 10);
const safe = (s: string) => s.trim().replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, "-").slice(0, 60);

export async function listComments(id: string): Promise<StudioComment[]> {
  return listOf(await http(`/studio/objects/${enc(id)}/comments`), ["items", "comments"]).map(normComment).filter((c) => c.text);
}

export async function addComment(id: string, text: string): Promise<void> {
  await http(`/studio/objects/${enc(id)}/comments`, { method: "POST", body: { comment: text } });
}

// POST /studio/objects/{id}/file — multipart `file` (expo File part, like the document analysis upload).
export async function uploadFile(id: string, uri: string, name: string): Promise<void> {
  const form = new FormData();
  form.append("file", new File(uri) as unknown as Blob, name);
  await http(`/studio/objects/${enc(id)}/file`, { method: "POST", body: form });
}

export const downloadVersionFile = (versionId: string, name: string) => downloadAndShare(`/studio/versions/${enc(versionId)}/file`, name || `studio-${versionId}`);
export const exportAll = () => downloadAndShare("/admin/studio/export.xlsx", `lexgo-studio-${stamp()}.xlsx`, XLSX);
export const exportVersions = (id: string, name: string) => downloadAndShare(`/admin/studio/objects/${enc(id)}/versions/export.xlsx`, `lexgo-studio-${safe(name) || id}-versions-${stamp()}.xlsx`, XLSX);

export async function heartbeat(h: StudioHeartbeat): Promise<string> {
  const body = { session_id: h.sessionId || null, constructor_code: h.code, object_id: h.objectId || null, version_id: h.versionId || null, save_count_delta: h.saves ?? 0, meta: { screen: `${h.code.toLowerCase()}-editor`, object_name: h.name ?? "" } };
  const res = asDict(await http("/studio/activity/heartbeat", { method: "POST", body }));
  return first(res.session_id, res.id) || h.sessionId || "";
}

export async function endActivity(sessionId: string): Promise<void> {
  if (sessionId) await http(`/studio/activity/${enc(sessionId)}/end`, { method: "POST" });
}

// GET /studio/reference/{key} — options of a select field (searchable on the server).
export async function listReference(key: string, q = "", limit = 50): Promise<StudioRef[]> {
  const raw = listOf(await http(`/studio/reference/${enc(key)}${qs({ q, limit })}`), ["items", "options"]);
  return raw.map((v) => ({ value: first(asDict(v).value, asDict(v).id, asDict(v).code), label: first(asDict(v).label, asDict(v).title, asDict(v).name, asDict(v).value) })).filter((r) => r.value);
}

export type TermSuggestion = { suggestions: string[]; provider: string };

// POST /studio/services/discovery-terms/suggest — AI search terms for a service. Nothing is saved; the form adds what the user picks.
export async function suggestDiscoveryTerms(body: Record<string, unknown>): Promise<TermSuggestion> {
  const d = asDict(await http("/studio/services/discovery-terms/suggest", { method: "POST", body }));
  const seen = new Set<string>();
  const suggestions = asArr(d.suggestions).map((x) => asStr(x).trim()).filter((x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()));
  return { suggestions, provider: asStr(d.provider) };
}
