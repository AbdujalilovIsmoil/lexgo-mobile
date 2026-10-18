import { asArr, asDict, asStr } from "@/shared/lib/json";
import { humanizeSlug } from "@/shared/lib/format";
import { cleanTitle } from "../lib/cleanTitle";
import type { DocAnswer, DocReq } from "../model/types";
import { normAttachment, normContract, normTemplateFile } from "./normalizeFile";

const HIDDEN = /(consent|^mode$|^need$|^language$|assignment_mode|editor_mode)/i;

// Client answers → readable rows: labels come from the template's own field list,
// objects / booleans / consent texts are dropped.
function answersOf(raw: unknown, template: unknown): DocAnswer[] {
  const labels = new Map<string, string>();
  for (const f of asArr(asDict(template).fields)) {
    const fd = asDict(f);
    const key = asStr(fd.name) || asStr(fd.key);
    if (key) labels.set(key, asStr(fd.label));
  }
  return Object.entries(asDict(raw))
    .filter(([k, v]) => !HIDDEN.test(k) && (typeof v === "string" || typeof v === "number") && String(v).trim() !== "")
    .map(([k, v]) => ({ label: labels.get(k) || humanizeSlug(k), value: String(v) }));
}

export function normDoc(v: unknown): DocReq {
  const d0 = asDict(v);
  const d = d0.lawyer_request ? asDict(d0.lawyer_request) : d0;
  const status = asStr(d.status);
  const room = asDict(d.secure_chat_room);
  const chat = asDict(d.chat);
  return {
    id: asStr(d.id),
    documentRequestId: asStr(d.document_request_id),
    status,
    title: cleanTitle(asStr(d.title)) || cleanTitle(asStr(asDict(d.template).title)),
    need: asStr(d.need),
    requestedType: asStr(d.requested_document_type),
    customType: d.requested_document_type_is_custom === true,
    flow: asStr(d.flow),
    language: asStr(d.language),
    editorSource: asStr(d.editor_source),
    clientName: asStr(asDict(d.client).name),
    serviceName: cleanTitle(asStr(asDict(d.service).title)),
    templateName: cleanTitle(asStr(asDict(d.template).title)),
    answers: answersOf(d.answers, d.template),
    files: asArr(d.attachments).map(normAttachment).filter((f) => f.path),
    templateFile: normTemplateFile(d.template_file),
    finalFile: normContract(d.contract_file),
    assignedName: asStr(asDict(d.assigned_lawyer).name),
    assignedId: asStr(d.assigned_lawyer_user_id),
    canClaim: typeof d.can_claim === "boolean" ? d.can_claim : status === "open_pool",
    canOpenEditor: typeof d.can_open_editor === "boolean" ? d.can_open_editor : status === "claimed",
    blockReason: asStr(d.editor_block_reason),
    systemEditor: d.system_editor_supported !== false,
    legacyUpload: d.legacy_upload_supported === true,
    chatRoomId: asStr(room.id) || asStr(chat.room_id),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}
