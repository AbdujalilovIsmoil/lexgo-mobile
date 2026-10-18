import { isoDay } from "@/shared/lib/format";
import type { AidRequest } from "./types";

export const TINT = { ok: "#22C55E", warn: "#F59E0B", err: "#EF4444", blue: "#3B82F6" };
const DONE = /^(resolved|completed|done|closed|approved)$/;
const BAD = /^(rejected|cancelled|canceled|failed)$/;

export const isDone = (s: string) => DONE.test(s);
// Colour of a request: new/unknown = amber (needs a look), assigned/in work = blue, finished = green, refused = red.
export const aidTint = (s: string) => (!s || s === "new" ? TINT.warn : isDone(s) ? TINT.ok : BAD.test(s) ? TINT.err : TINT.blue);

// Newest first; requests without a parsable date keep their server order at the end.
export const newestFirst = (a: AidRequest, b: AidRequest) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);

export function aidStats(list: AidRequest[]) {
  const today = isoDay();
  const fresh = (r: AidRequest) => !r.status || r.status === "new";
  return {
    total: list.length,
    today: list.filter((r) => r.createdAt.slice(0, 10) === today).length,
    fresh: list.filter(fresh).length,
    working: list.filter((r) => !fresh(r) && !isDone(r.status) && !BAD.test(r.status)).length,
    done: list.filter((r) => isDone(r.status)).length,
    refused: list.filter((r) => BAD.test(r.status)).length,
  };
}
