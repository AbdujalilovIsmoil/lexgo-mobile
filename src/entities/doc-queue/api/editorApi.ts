import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { asDict, asStr } from "@/shared/lib/json";
import type { DraftResult, EditorSession, FinalizeResult, MeetingResult, Sources } from "../model/editorTypes";
import { normEditor, normFinalize, normSources } from "./normalizeEditor";

const base = (id: string) => `/lawyers/me/document-requests/${encodeURIComponent(id)}`;
type Local = { uri: string; name: string };

export const getEditor = async (id: string): Promise<EditorSession> => normEditor(await http(`${base(id)}/editor`), id);
export const getSources = async (id: string): Promise<Sources> => normSources(await http(`${base(id)}/editor/sources`));

// POST …/editor/source — template | blank | ai_draft | attachment(+attachment_id). The backend closes the old editor session.
export async function selectSource(id: string, type: string, attachmentId = ""): Promise<void> {
  await http(`${base(id)}/editor/source`, { method: "POST", body: { source_type: type, ...(attachmentId ? { attachment_id: attachmentId } : {}) } });
}

// POST …/editor/source-upload — the advocate's own .docx becomes the editor source.
export async function uploadSource(id: string, file: Local, note = ""): Promise<void> {
  const form = new FormData();
  appendFile(form, "file", file);
  if (note) form.append("note", note);
  await http(`${base(id)}/editor/source-upload`, { method: "POST", body: form });
}

// PUT …/editor/draft — marks / stores the draft; answers {ok, last_saved_at}.
export async function saveDraft(id: string, body: { content_text?: string; content_html?: string } = {}): Promise<DraftResult> {
  const d = asDict(await http(`${base(id)}/editor/draft`, { method: "PUT", body }));
  return { savedAt: asStr(d.last_saved_at) };
}

// POST …/editor/finalize — the backend force-saves the open editor first; 409 `editor_save_required` while that has not landed.
export async function finalizeDoc(id: string, notes: string): Promise<FinalizeResult> {
  return normFinalize(await http(`${base(id)}/editor/finalize`, { method: "POST", body: { notes } }));
}

// POST …/fulfill-file — legacy path: send a finished .docx for template-backed requests.
export async function fulfillFile(id: string, file: Local, notes = ""): Promise<FinalizeResult> {
  const form = new FormData();
  appendFile(form, "file", file);
  if (notes) form.append("notes", notes);
  return normFinalize(await http(`${base(id)}/fulfill-file`, { method: "POST", body: form }));
}

// POST …/meeting — a new LiveKit call in the request's secure-chat room (every POST creates one).
export async function createMeeting(id: string, title: string, type: "video" | "audio" = "video"): Promise<MeetingResult> {
  const d = asDict(await http(`${base(id)}/meeting`, { method: "POST", body: { call_type: type, title } }));
  return { id: asStr(d.id), roomId: asStr(d.room_id) };
}
