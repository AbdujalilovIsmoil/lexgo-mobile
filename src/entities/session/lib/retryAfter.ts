import { ApiError } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

const MIN = /(\d+)\s*(daqiqa|minut|мин|min)/i;
const SEC = /(\d+)\s*(soniya|sekund|сек|sec)/i;

// How long the server asks the client to wait, in seconds (0 = no hint). Sources, best first:
// Retry-After header / top-level retry_after, detail.retry_after, detail.blocked_until, and the
// wording itself ("15 daqiqadan keyin …").
export function retryAfterOf(e: unknown, now = Date.now()): number {
  if (!(e instanceof ApiError)) return 0;
  const det = asDict(e.data.detail);
  const direct = Number(e.retryAfter ?? det.retry_after);
  if (Number.isFinite(direct) && direct > 0) return Math.min(Math.ceil(direct), 86400);
  const until = Date.parse(asStr(det.blocked_until));
  if (Number.isFinite(until) && until > now) return Math.min(Math.ceil((until - now) / 1000), 86400);
  const text = e.detail ?? "";
  const m = MIN.exec(text);
  if (m && Number(m[1]) > 0) return Number(m[1]) * 60;
  const s = SEC.exec(text);
  return s && Number(s[1]) > 0 ? Number(s[1]) : 0;
}

// The code (or the whole challenge) is dead: 410, or expiry wording that is not a "wrong code" one.
export function isCodeExpired(e: unknown): boolean {
  if (!(e instanceof ApiError)) return false;
  if (e.status === 410) return true;
  const d = e.detail ?? "";
  if (/noto.?g.?ri|xato(?!lik)|wrong|invalid|incorrect|неверн|неправил/i.test(d)) return false;
  return /expir|supersed|muddat|eskir|истек|истёк|устарел/i.test(d);
}
