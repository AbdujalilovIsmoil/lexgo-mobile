import { File } from "expo-file-system";
import { http } from "@/shared/api";
import { gated } from "../model/gates";
import type { GapFilter, Reglament, ReglamentInput, UploadInput, Gap, Loaded } from "../model/types";
import { listOf } from "./norm";
import { normGap } from "./normGap";
import { mergeReglament, needsDetails, normReglament } from "./normReglament";

const BASE = "/admin/ai/support/reglaments";
const LIST_KEYS = ["items", "reglaments", "results", "data", "rows", "list"];
const GAP_KEYS = ["items", "gaps", "results", "data", "rows", "list"];

// GET /admin/ai/support/reglaments — the whole list (rule documents the AI answers from).
export const listReglaments = (): Promise<Loaded<Reglament[]>> =>
  gated("list", async () => listOf(await http(BASE), LIST_KEYS).map(normReglament).filter((r): r is Reglament => r !== null));

// GET …/{id} — not enabled on every backend; null when it is missing or fails.
export async function getReglament(id: string): Promise<Reglament | null> {
  try {
    const res = await gated("details", async () => normReglament(await http(`${BASE}/${encodeURIComponent(id)}`)));
    return res.kind === "ok" ? res.data : null;
  } catch {
    return null;
  }
}

// POST … {title, category, version, content, status}.
export const createReglament = (input: ReglamentInput): Promise<Loaded<Reglament | null>> =>
  gated("create", async () => normReglament(await http(BASE, { method: "POST", body: input })));

// PATCH …/{id} — saved as a new version.
export const updateReglament = (id: string, input: ReglamentInput): Promise<Loaded<Reglament | null>> =>
  gated("update", async () => normReglament(await http(`${BASE}/${encodeURIComponent(id)}`, { method: "PATCH", body: input })));

// POST …/upload (multipart title, category, version, file): the backend extracts the text of a .docx / .doc / .pdf.
export function uploadReglament(i: UploadInput): Promise<Loaded<Reglament | null>> {
  const form = new FormData();
  form.append("title", i.title);
  form.append("category", i.category);
  form.append("version", i.version);
  form.append("file", new File(i.file.uri) as unknown as Blob, i.file.name);
  return gated("upload", async () => normReglament(await http(`${BASE}/upload`, { method: "POST", body: form })));
}

// GET …/gaps[?status=open] — questions the AI could not answer.
export const listGaps = (filter: GapFilter): Promise<Loaded<Gap[]>> =>
  gated("gaps", async () => listOf(await http(`${BASE}/gaps${filter === "open" ? "?status=open" : ""}`), GAP_KEYS).map(normGap).filter((g): g is Gap => g !== null));

// A list row with its text and versions, fetching the detail only when the list left them out.
export const resolveReglament = async (r: Reglament): Promise<Reglament> => (needsDetails(r) ? mergeReglament(r, await getReglament(r.id)) : r);
