import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { enqueue, registerOutboxHandler } from "./outbox";

// Generic idempotent PUT. Only listed paths may be queued (the body replaces the same resource,
// so sending it twice is harmless). Add a pattern with allowOutboxPut() to opt a PUT in.
const allowed: RegExp[] = [/^\/notifications\/preferences$/, /^\/document-requests\/[\w-]+\/answers$/];

export const allowOutboxPut = (re: RegExp): void => void allowed.push(re);
const ok = (path: string): boolean => allowed.some((re) => re.test(path));

registerOutboxHandler("api.put", async (payload) => {
  const p = asDict(payload);
  const path = asStr(p.path);
  if (!ok(path)) throw new Error("outbox: path not allowed");
  await http(path, { method: "PUT", body: p.body });
});

/** Queue `PUT path` for later; `dedupe` defaults to the path so only the newest body is kept. */
export const enqueuePut = (path: string, body: unknown): Promise<boolean> => (ok(path) ? enqueue("api.put", { path, body }, path) : Promise.resolve(false));
