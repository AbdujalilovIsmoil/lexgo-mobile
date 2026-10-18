export type RStatus = "active" | "draft" | "archived";
export const STATUSES: RStatus[] = ["active", "draft", "archived"];
export const CATEGORIES = ["support", "payment", "marketplace", "documents", "urgent", "other"];
export type Gate = "list" | "gaps" | "details" | "create" | "update" | "upload";
export type Loaded<T> = { kind: "ok"; data: T } | { kind: "missing" };

export type Version = { key: string; id: string; version: string; status: RStatus | ""; content: string; createdAt: string; author: string; source: string; fileName: string; note: string };

export type Reglament = {
  id: string;
  title: string;
  category: string;
  version: string;
  status: RStatus;
  statusRaw: string;
  content: string;
  updatedAt: string;
  createdAt: string;
  author: string;
  source: string;
  fileName: string;
  versions: Version[];
};

// A question the AI could not answer from the reglaments.
export type Gap = { key: string; id: string; question: string; count: number; lastAskedAt: string; sessionId: string; userName: string; userPhone: string; role: string; status: string; category: string; reason: string; missing: string[] };

export type ReglamentInput = { title: string; category: string; version: string; content: string; status: RStatus };
export type UploadInput = { title: string; category: string; version: string; file: { uri: string; name: string; size: number } };
export type GapFilter = "open" | "all";
