import type { Dict } from "@/shared/lib/json";
import type { CtorNav } from "./typesNav";

export type StudioPayload = Dict;
export type StudioStatus = "draft" | "submitted" | "in_review" | "changes_requested" | "approved" | "published" | "archived";
export const STUDIO_STATUSES: StudioStatus[] = ["draft", "submitted", "in_review", "changes_requested", "approved", "published", "archived"];
export const STUDIO_ROLES = ["studio_editor", "studio_reviewer", "studio_publisher", "studio_admin"] as const;
export const STUDIO_FILE_EXT = [".docx", ".doc", ".pdf", ".xlsx", ".xls", ".txt"];
export type StudioDecision = "approve" | "changes_requested" | "reject";

// One field of a constructor schema (GET /studio/constructors/{code}).
// `item` = element schema of a list; `props` = member schema of an object (or of a list of objects); `managed` = filled from the route context, never typed.
export type StudioField = { key: string; label: string; type: string; required: boolean; section: string; help: string; options: string[]; source: string; min?: number; minItems?: number; item?: StudioField; props?: StudioField[]; managed?: boolean; def?: unknown };
export type StudioConstructor = {
  code: string;
  title: string;
  category: string;
  description: string;
  runtime: string;
  approvalRequired: boolean;
  required: string[];
  fieldCount: number;
  fields: StudioField[];
  nav?: CtorNav;
};
export type StudioObject = {
  id: string;
  code: string;
  title: string;
  status: StudioStatus;
  statusRaw: string;
  currentVersionId: string;
  currentVersion: string;
  publishedVersionId: string;
  assignedTo: string;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
  hasFile: boolean;
  raw: Dict;
};
export type StudioVersion = { id: string; version: string; status: StudioStatus; statusRaw: string; payload: StudioPayload; summary: string; fileName: string; hasFile: boolean; createdAt: string; createdBy: string };
export type StudioStep = { id: string; order: number; role: string; title: string; status: string; decidedBy: string; decidedAt: string; comment: string; canDecide: boolean | null };
export type StudioDetail = StudioObject & { payload: StudioPayload; versions: StudioVersion[]; steps: StudioStep[] };
export type StudioComment = { id: string; text: string; author: string; authorRole: string; versionId: string; createdAt: string };
