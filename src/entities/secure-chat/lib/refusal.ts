import { ApiError } from "@/shared/api/errors";
import { asDict, asNum, type Dict } from "@/shared/lib/json";
import { ALLOWED_LIST, MAX_MB, VIDEO_MAX_MB, isAllowedExt, sentExt } from "./fileRules";
import { fmtSize } from "./fmtSize";

/** Why the server does not take a file. Each reason has its own text in the user's language. */
export type Refusal = { kind: "type" } | { kind: "size" } | { kind: "quota"; left: number } | { kind: "broken" };

// A full workspace (1 GB per user) answers 413 with an object (message, quota_bytes, used_bytes, remaining_bytes, limit_gb,
// incoming_size) as `detail`, or as the body itself; one file over its limit gets a 413 with a bare Uzbek sentence. Neither has a code.
function quotaLeft(body: Dict): number | null {
  for (const d of [asDict(body.detail), body]) if ("remaining_bytes" in d || "quota_bytes" in d) return Math.max(0, asNum(d.remaining_bytes));
  return null;
}

/** Reads a refused upload: 413 (the file is over its limit, or the workspace is full), 415 (a type the server does not take, or a file that
 * is not what its extension says, e.g. a PDF without the PDF signature), 422 (a broken ZIP). Anything else gives null and keeps the
 * caller's own handling (409 closed room, 403, a lost connection). */
export function uploadRefusal(e: unknown, file: { uri: string; name: string }): Refusal | null {
  if (!(e instanceof ApiError)) return null;
  const ext = sentExt(file);
  if (e.status === 413) {
    const left = quotaLeft(e.data);
    return left === null ? { kind: "size" } : { kind: "quota", left };
  }
  if (e.status === 415) return isAllowedExt(ext) ? { kind: "broken" } : { kind: "type" };
  if (e.status === 422 && ext === "zip" && !Object.keys(e.fieldErrors).length) return { kind: "broken" };
  return null;
}

type Tr = (key: string, params?: Record<string, string | number>) => string;
/** How long a refusal toast stays: it names the files, and maybe all the allowed types. */
export const REFUSAL_MS = 7000;
// Three names at most, then "+N".
const listed = (names: string[]): string => names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");

/** The refusal in the user's language, naming the files it is about; a type refusal lists the types that are allowed. */
export function refusalText(t: Tr, r: Refusal, names: string[] = []): string {
  if (r.kind === "type") return t("admChat.badType", { names: listed(names), types: ALLOWED_LIST });
  if (r.kind === "size") return t("admChat.tooBig", { names: listed(names), mb: MAX_MB, video: VIDEO_MAX_MB });
  if (r.kind === "quota") return r.left > 0 ? t("admChat.quotaLeft", { left: fmtSize(r.left) }) : t("admChat.quotaFull");
  return t("admChat.broken", { names: listed(names) });
}
