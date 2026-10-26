import type { DocReq } from "./types";
import { isEditorFlow } from "./status";

// What the signed-in advocate may do with a record. Backend flags first (can_claim / can_open_editor);
// the rest follows the status — nothing is offered that the backend has not allowed.
export function docCan(doc: DocReq, meId: string) {
  const claimed = doc.status === "claimed";
  return {
    claim: doc.canClaim,
    editor: isEditorFlow(doc.status) && doc.canOpenEditor && !doc.canClaim && doc.status !== "completed" && doc.systemEditor,
    sent: doc.status === "completed" && !!doc.finalFile,
    transfer: claimed && doc.assignedId === meId,
    upload: doc.legacyUpload && !!doc.templateFile && (claimed || doc.status === "new"),
    chat: !!doc.chatRoomId,
    meeting: claimed && !!doc.chatRoomId,
    blocked: isEditorFlow(doc.status) && !doc.canOpenEditor && !doc.canClaim && doc.status !== "completed",
  };
}
