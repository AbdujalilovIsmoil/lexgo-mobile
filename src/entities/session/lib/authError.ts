import { ApiError } from "@/shared/api";
import { isCodeExpired, retryAfterOf } from "./retryAfter";

// What went wrong, in terms the auth screens branch on. `message` is the server's own wording
// (may be Uzbek only or empty); `wait` is the server's cooldown / block length in seconds.
export type AuthErrKind = "offline" | "rate" | "blocked" | "expired" | "wrong" | "exists" | "channel" | "forbidden" | "validation" | "server" | "other";
export type AuthErr = { kind: AuthErrKind; message: string; wait: number; status: number; fields: Record<string, string> };

// A wait this long is a block (3 wrong codes → 15 min), shorter ones are a resend cooldown.
const BLOCK_SEC = 180;

export function describeAuthError(e: unknown): AuthErr {
  if (!(e instanceof ApiError)) return { kind: "server", message: "", wait: 0, status: -1, fields: {} };
  const base = { message: e.detail && e.detail !== "network_error" ? e.detail : "", wait: retryAfterOf(e), status: e.status, fields: e.fieldErrors };
  const kind = (k: AuthErrKind): AuthErr => ({ ...base, kind: k });
  if (e.status === 0) return kind("offline");
  if (e.status === 429) return kind(base.wait >= BLOCK_SEC || /marta|blocked|заблок|attempts/i.test(base.message) ? "blocked" : "rate");
  if (e.status === 409) return kind("exists");
  if (e.status === 503) return kind("channel");
  if (e.status >= 500) return kind("server");
  if (isCodeExpired(e)) return kind("expired");
  if (e.status === 422) return kind("validation");
  if (e.status === 403) return kind("forbidden");
  if (e.status === 400 || e.status === 401 || e.status === 404) return kind("wrong");
  return kind("other");
}
