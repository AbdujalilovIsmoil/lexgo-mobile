import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { DOC_SERVICE_MODES, type DocRuntime, type DocServiceMode, type DocSettings, type ModeAccess } from "../model/types";

const isMode = (v: string): v is DocServiceMode => (DOC_SERVICE_MODES as string[]).includes(v);
const word = (v: unknown): string => asStr(v).trim().toLowerCase().replace(/^\./, "");
// A list the backend stated (even an empty one), or null when it sent none.
const listOf = (v: unknown): string[] | null => (Array.isArray(v) ? [...new Set(v.map(word).filter(Boolean))] : null);
const positive = (v: unknown): number | null => {
  const n = asNum(v, NaN);
  return n > 0 ? n : null;
};

// The published payload. The admin form never saves an empty format or mode list, so an empty one reads as "not stated", never as
// "nothing allowed"; the download formats are taken as sent ([] closes every document format).
function normSettings(v: unknown): DocSettings {
  const d = asDict(v);
  const formats = listOf(d.allowed_formats);
  const modes = listOf(d.modes);
  const pages = positive(d.included_pages);
  return {
    formats: formats?.length ? formats : null,
    maxFileMb: positive(d.max_file_mb),
    includedPages: pages === null ? null : Math.max(1, Math.floor(pages)),
    modes: modes?.length ? modes.filter(isMode) : null,
    downloadFormats: listOf(asDict(d.download_policy).formats),
  };
}

// One decision per mode: an object keyed by mode (the documented shape) or a list of entries carrying `mode`. A code without
// `allowed` counts as a refusal; a mode the app does not know is skipped.
function accessOf(v: unknown): DocRuntime["access"] {
  if (!v || typeof v !== "object") return null;
  const rows: [string, Dict][] = Array.isArray(v) ? v.map((x) => [word(asDict(x).mode), asDict(x)]) : Object.entries(asDict(v)).map(([k, x]) => [word(k), asDict(x)]);
  const out: Partial<Record<DocServiceMode, ModeAccess>> = {};
  for (const [mode, d] of rows) {
    if (!isMode(mode) || !Object.keys(d).length) continue;
    const code = asStr(d.code).trim();
    out[mode] = { allowed: typeof d.allowed === "boolean" ? d.allowed : !code, code, message: asStr(d.message ?? d.detail ?? d.reason).trim() };
  }
  return out;
}

// GET /document-service-settings/runtime: { settings, version, settings_id, access, contract, … }. Anything missing leaves the
// screens on their own defaults; `access` is null for a guest.
export function normRuntime(v: unknown): DocRuntime {
  const d = asDict(v);
  return { settings: normSettings(d.settings ?? d), access: accessOf(d.access) };
}
