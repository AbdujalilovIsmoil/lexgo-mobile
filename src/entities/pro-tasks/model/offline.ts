import { http } from "@/shared/api";
import { enqueue, idempotencyHeaders, patchOutbox, registerOutboxHandler } from "@/shared/cache";
import { asDict, asStr } from "@/shared/lib/json";
import { normTask, setTaskStatus } from "../api/taskApi";
import type { TaskInput } from "./types";

// Offline writes for tasks. Create, edit and status moves are safe to replay (a status/edit overwrites the same
// fields; a create carries an Idempotency-Key); delete is deliberately NOT queued. Conflict rule: last write
// wins per task, and when the server rejects a queued change (4xx) it is dropped and the list reloads server truth.
export const KIND_CREATE = "task.create";
export const KIND_UPDATE = "task.update";
export const KIND_STATUS = "task.status";
const INVALIDATE = [["pro-tasks"]] as const;

export const isLocalId = (id: string): boolean => id.startsWith("local-");
export const newLocalId = (): string => `local-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

type CreatePayload = { input: TaskInput & { title: string }; status?: string };

registerOutboxHandler(
  KIND_CREATE,
  async (payload, item) => {
    const p = asDict(payload) as unknown as CreatePayload;
    const made = normTask(await http("/tasks", { method: "POST", body: p.input, headers: idempotencyHeaders(item) }));
    // The status chosen while the task was still local is applied after the create; best effort, the create must not repeat.
    if (p.status && p.status !== "todo" && made.id) await setTaskStatus(made.id, p.status).catch(() => undefined);
  },
  { invalidate: INVALIDATE },
);
registerOutboxHandler(
  KIND_UPDATE,
  async (payload, item) => {
    const p = asDict(payload);
    await http(`/tasks/${encodeURIComponent(asStr(p.id))}`, { method: "PATCH", body: p.body, headers: idempotencyHeaders(item) });
  },
  { invalidate: INVALIDATE },
);
registerOutboxHandler(
  KIND_STATUS,
  async (payload, item) => {
    const p = asDict(payload);
    await http(`/tasks/${encodeURIComponent(asStr(p.id))}/status`, { method: "PATCH", body: { status: asStr(p.status) }, headers: idempotencyHeaders(item) });
  },
  { invalidate: INVALIDATE },
);

export async function queueCreate(localId: string, input: TaskInput & { title: string }): Promise<boolean> {
  return enqueue(KIND_CREATE, { input } satisfies CreatePayload, localId);
}

export async function queueUpdate(id: string, patch: TaskInput): Promise<boolean> {
  if (isLocalId(id)) return patchOutbox(KIND_CREATE, id, (old) => ({ ...asDict(old), input: { ...asDict(asDict(old).input), ...patch } }));
  if (await patchOutbox(KIND_UPDATE, id, (old) => ({ id, body: { ...asDict(asDict(old).body), ...patch } }))) return true;
  return enqueue(KIND_UPDATE, { id, body: patch }, id);
}

export async function queueStatus(id: string, status: string): Promise<boolean> {
  if (isLocalId(id)) return patchOutbox(KIND_CREATE, id, (old) => ({ ...asDict(old), status }));
  return enqueue(KIND_STATUS, { id, status }, id);
}
