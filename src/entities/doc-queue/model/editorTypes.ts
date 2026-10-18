// What the editor can open on (GET …/editor/sources).
export type SourceOption = {
  key: string;
  type: string; // template | blank | ai_draft | attachment
  title: string;
  note: string;
  available: boolean;
  attachmentId: string;
  kind: string; // lawyer_file | client_file …
};
export type Sources = { current: string; currentAttachment: string; label: string; options: SourceOption[] };

// GET …/editor. `config` is the OnlyOffice config exactly as the server signed it.
export type EditorSession = {
  recordId: string;
  sessionId: string;
  provider: string;
  configured: boolean;
  serverUrl: string;
  origin: string;
  config: Record<string, unknown>;
  fileUrl: string;
};
export type DraftResult = { savedAt: string };
export type FinalizeResult = { status: string; fileName: string; filePath: string; ratingDeadline: string };
export type MeetingResult = { id: string; roomId: string };
