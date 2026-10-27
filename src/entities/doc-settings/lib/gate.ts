import { ApiError } from "@/shared/api";
import { asStr } from "@/shared/lib/json";
import { ACCESS_CODES, type AccessCode, type DocRuntime, type DocServiceMode, type ModeGate, type UploadRule } from "../model/types";

const OPEN: ModeGate = { state: "open", code: "", message: "" };
const PLAN = new Set<string>(["document_subscription_required", "document_plan_not_allowed", "document_entitlement_required"]);
// The download policy covers document formats only; any other file (a photo, an attachment) is left to the backend.
const POLICED = new Set(["pdf", "doc", "docx"]);

const isAccessCode = (v: unknown): v is AccessCode => (ACCESS_CODES as readonly unknown[]).includes(v);
// A refusal a plan can lift: the way out is "choose a plan".
export const isPlanCode = (code: string): boolean => PLAN.has(code);

// A mode as a screen treats it. The account's own decision wins; without one (a guest) the published mode list decides; with no
// settings at all (loading, offline, an error) everything stays open as before — the backend still enforces its policy.
export function gateOf(rt: DocRuntime | undefined, mode: DocServiceMode): ModeGate {
  if (!rt) return OPEN;
  const a = rt.access?.[mode];
  if (a) return a.allowed ? OPEN : { state: a.code === "document_mode_disabled" ? "off" : "locked", code: a.code, message: a.message };
  return rt.settings.modes && !rt.settings.modes.includes(mode) ? { state: "off", code: "document_mode_disabled", message: "" } : OPEN;
}

// An upload screen's rule: what the settings state, the screen's own for the rest.
export const uploadRule = (rt: DocRuntime | undefined, own: UploadRule): UploadRule => ({ mb: rt?.settings.maxFileMb ?? own.mb, formats: rt?.settings.formats ?? own.formats });

// Whether a document in this format may be downloaded. An unknown format, or settings not in yet, is left to the backend.
export function downloadOk(rt: DocRuntime | undefined, format: string): boolean {
  const allowed = rt?.settings.downloadFormats;
  const f = format.trim().toLowerCase().replace(/^\./, "");
  return !allowed || !POLICED.has(f) || allowed.includes(f);
}

// The document service code of a refused request: FastAPI's structured `detail.code`, a top-level `code`, or the bare code as `detail`.
export function refusalCode(e: unknown): AccessCode | null {
  if (!(e instanceof ApiError)) return null;
  return [e.code, asStr(e.data.code), e.detail].find(isAccessCode) ?? null;
}

// A closed mode in plain words: ours for a known code, else the backend's own sentence, else a general one.
export const gateText = (t: (key: string) => string, g: Pick<ModeGate, "code" | "message">): string =>
  isAccessCode(g.code) ? t(`dset.code.${g.code}`) : g.message || t("dset.closedText");
