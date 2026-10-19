import { listRows, notificationKeys } from "@/entities/notification";
import { chatKeys, listRooms } from "@/entities/secure-chat";
import { useSessionStore } from "@/entities/session";
import { listTasks, taskKeys } from "@/entities/pro-tasks";
import { flushOutbox, setCacheScope } from "@/shared/cache";
import { saveSnapshot } from "@/shared/cache/persister";
import "@/entities/pro-tasks/model/offline"; // registers the outbox handlers: a headless start imports no screens

// Budget of one background run. The OS gives about 30 s (Android WorkManager / iOS BGTaskScheduler) and kills the
// job after that, so nothing starts once 20 s are used.
const BUDGET_MS = 20_000;

export type SyncResult = { flushed: number; dropped: number; refreshed: string[] };

type Job = { name: string; roles?: string[]; run: () => Promise<void> };

// Only data with a plain, known cache shape is refreshed here: the saved snapshot is exactly what the screen's query
// would hold, so the next cold start / offline open paints it at once. Chat message history is NOT cached or prefetched.
const JOBS: Job[] = [
  { name: "notifications", run: async () => saveSnapshot(notificationKeys.list, { pages: [await listRows({ offset: 0 })], pageParams: [0] }) },
  { name: "messages", run: async () => saveSnapshot(chatKeys.rooms, await listRooms()) },
  { name: "tasks", roles: ["lawyer", "advocate"], run: async () => saveSnapshot(taskKeys.all, await listTasks()) },
];

/** Sends the queued offline writes, then refreshes the key lists on disk. Never throws; stops at the time budget. */
export async function backgroundSync(now: () => number = Date.now): Promise<SyncResult> {
  const out: SyncResult = { flushed: 0, dropped: 0, refreshed: [] };
  if (!useSessionStore.getState().session) await useSessionStore.getState().hydrate();
  const user = useSessionStore.getState().session?.user;
  if (!user) return out; // signed out: guests have nothing local, nothing to do
  setCacheScope(user.id);
  const deadline = now() + BUDGET_MS;
  try {
    const r = await flushOutbox();
    out.flushed = r.sent;
    out.dropped = r.dropped;
  } catch {
    /* the outbox keeps its items for the next run */
  }
  for (const job of JOBS) {
    if (now() > deadline) break;
    if (job.roles && !job.roles.includes(user.role)) continue;
    try {
      await job.run();
      out.refreshed.push(job.name);
    } catch {
      /* offline / 403 / server error: keep the old snapshot */
    }
  }
  return out;
}
