// A file the advocate can open: client attachments, the template, the finished contract.
export type DocFile = { id: string; name: string; mime: string; size: number; path: string; note: string; kind: string };
export type DocAnswer = { label: string; value: string };

// One lawyer-request record (`/lawyers/me/document-requests`). No phone number on purpose:
// the advocate reaches the client through the secure chat / meeting, not by phone.
export type DocReq = {
  id: string;
  documentRequestId: string;
  status: string;
  title: string;
  need: string;
  requestedType: string;
  customType: boolean;
  flow: string;
  language: string;
  editorSource: string;
  clientName: string;
  serviceName: string;
  templateName: string;
  answers: DocAnswer[];
  files: DocFile[];
  templateFile: DocFile | null;
  finalFile: DocFile | null;
  assignedName: string;
  assignedId: string;
  canClaim: boolean;
  canOpenEditor: boolean;
  blockReason: string;
  systemEditor: boolean;
  legacyUpload: boolean;
  chatRoomId: string;
  createdAt: string;
  updatedAt: string;
};

export type ClaimResult = { id: string; status: string; chatRoomId: string };
export type TransferInput = { id: string; targetId: string; reason: string; pool: boolean };
export type Candidate = { id: string; name: string; kind: string; region: string; rating: number; workload: number; callCenter: boolean };
