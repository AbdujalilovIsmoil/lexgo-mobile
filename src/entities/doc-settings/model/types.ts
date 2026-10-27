// The document service settings the platform publishes (TZ.md §4, GET /document-service-settings/runtime), as the app uses them.
export type DocServiceMode = "manual" | "lawyer" | "review" | "analysis";
export const DOC_SERVICE_MODES: DocServiceMode[] = ["manual", "lawyer", "review", "analysis"];

// Why the backend closes a mode or refuses a document action.
export const ACCESS_CODES = ["document_mode_disabled", "document_subscription_required", "document_plan_not_allowed", "document_entitlement_required", "document_download_format_disabled"] as const;
export type AccessCode = (typeof ACCESS_CODES)[number];

// null = not stated by the backend: the screen keeps its own value (what it did before the settings existed).
export type DocSettings = {
  formats: string[] | null; // allowed_formats: lower case, no dot
  maxFileMb: number | null;
  includedPages: number | null;
  modes: DocServiceMode[] | null;
  downloadFormats: string[] | null; // download_policy.formats; [] = no document format may be downloaded
};

// One mode's decision for the signed-in account (sent only with a token).
export type ModeAccess = { allowed: boolean; code: string; message: string };
export type DocRuntime = { settings: DocSettings; access: Partial<Record<DocServiceMode, ModeAccess>> | null };

// What a screen does with a mode: offer it, drop it (switched off for everybody), or keep it closed with the reason.
export type ModeGate = { state: "open" | "off" | "locked"; code: string; message: string };

// An upload screen's rule: size limit and accepted formats.
export type UploadRule = { mb: number; formats: string[] };
