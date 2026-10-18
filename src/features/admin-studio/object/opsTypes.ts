import type { ObjectTarget, Draft, StudioConstructor, StudioDetail } from "@/entities/admin-studio";
import type { Errors } from "../form/types";

export type Busy = "" | "save" | "submit" | "archive" | "publish" | "rollback" | "upload" | "comment";
export type SaveMeta = { summary?: string; version?: string };

// What the write operations need from the editor state.
export type OpsCtx = {
  id: string;
  code: string;
  draft: Draft | null;
  dirty: boolean;
  ctor: StudioConstructor | null;
  approvalFree: boolean;
  needFile: boolean;
  target?: ObjectTarget;
  hasFile: boolean;
  apply: (d: StudioDetail) => void;
  markSaved: () => void;
  release: () => void;
  setErrors: (e: Errors) => void;
};
