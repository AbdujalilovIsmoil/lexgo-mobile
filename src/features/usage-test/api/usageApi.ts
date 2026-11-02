import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { DEFAULT_CONFIG, type BatchResult, type QueuedEvent, type Registration, type SendBody, type SendResult, type UsageConfig, type UsageEventType } from "../model/types";

const PATH: Record<UsageEventType, string> = { foreground: "/mobile/testing/sessions/start", heartbeat: "/mobile/testing/sessions/heartbeat", background: "/mobile/testing/sessions/finish" };

export function normConfig(v: unknown): UsageConfig {
  const d = asDict(v);
  const n = (x: unknown, fallback: number) => (asNum(x) > 0 ? asNum(x) : fallback);
  return {
    enabled: d.enabled === true,
    platforms: asArr(d.platforms).map((x) => asStr(x)).filter(Boolean),
    heartbeatSeconds: n(d.heartbeat_interval_seconds, DEFAULT_CONFIG.heartbeatSeconds),
    staleSeconds: n(d.stale_after_seconds, DEFAULT_CONFIG.staleSeconds),
    offlineSyncDays: n(d.offline_sync_days, DEFAULT_CONFIG.offlineSyncDays),
    batchMax: n(d.batch_max_events, DEFAULT_CONFIG.batchMax),
  };
}

// GET /mobile/testing/config
export const getConfig = async (): Promise<UsageConfig> => normConfig(await http("/mobile/testing/config"));

// POST /mobile/testing/installations/register — idempotent for one installation key; returns the backend installation id.
export async function register(body: Registration): Promise<{ id: string; heartbeatSeconds: number }> {
  const d = asDict(await http("/mobile/testing/installations/register", { method: "POST", body }));
  return { id: asStr(asDict(d.installation).id), heartbeatSeconds: asNum(d.heartbeat_interval_seconds) };
}

// POST …/sessions/start | heartbeat | finish
export async function sendOne(type: UsageEventType, body: SendBody): Promise<SendResult> {
  const d = asDict(await http(PATH[type], { method: "POST", body }));
  return { serverTime: asStr(d.server_time), duplicate: d.duplicate === true };
}

// POST /mobile/testing/events/batch — `accepted` lists the event ids the backend took (duplicates included: they are done too).
export async function sendBatch(installationId: string, events: QueuedEvent[]): Promise<BatchResult> {
  const body = { installation_id: installationId, events: events.map((e) => ({ event_id: e.event_id, client_session_id: e.client_session_id, event_type: e.event_type, occurred_at: e.occurred_at })) };
  const d = asDict(await http("/mobile/testing/events/batch", { method: "POST", body }));
  const items = asArr(d.items).map(asDict);
  const accepted = items.length ? items.map((x) => asStr(x.event_id)).filter(Boolean) : d.ok === true ? events.map((e) => e.event_id) : [];
  return { serverTime: asStr(d.server_time), accepted };
}
