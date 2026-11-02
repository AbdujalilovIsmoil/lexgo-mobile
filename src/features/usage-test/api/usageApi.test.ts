import { getConfig, normConfig, register, sendBatch, sendOne } from "./usageApi";

const mockCalls: { path: string; init?: { method?: string; body?: unknown } }[] = [];
const mockReply: { v: unknown } = { v: {} };
jest.mock("@/shared/api", () => ({ http: async (path: string, init?: { method?: string; body?: unknown }) => { mockCalls.push({ path, init }); return mockReply.v; } }));
const calls = mockCalls;
const set = (v: unknown) => { mockReply.v = v; };

beforeEach(() => { calls.length = 0; });

describe("usage analytics API", () => {
  it("reads the backend config and keeps safe defaults for missing numbers", async () => {
    set({ enabled: true, platforms: ["android"], heartbeat_interval_seconds: 60, stale_after_seconds: 180, offline_sync_days: 7, batch_max_events: 500 });
    expect(await getConfig()).toEqual({ enabled: true, platforms: ["android"], heartbeatSeconds: 60, staleSeconds: 180, offlineSyncDays: 7, batchMax: 500 });
    expect(calls[0].path).toBe("/mobile/testing/config");
    expect(normConfig({ enabled: "yes" })).toMatchObject({ enabled: false, heartbeatSeconds: 60, batchMax: 500 });
  });

  it("registers and returns the backend installation id", async () => {
    set({ created: true, installation: { id: "inst-uuid" }, heartbeat_interval_seconds: 90 });
    const r = await register({ installation_key: "k", platform: "android", distribution_track: "closed", app_version: "1.1.0", version_code: 4, manufacturer: "Google", model: "Pixel", os_version: "15", locale: "uz" });
    expect(r).toEqual({ id: "inst-uuid", heartbeatSeconds: 90 });
    expect(calls[0]).toMatchObject({ path: "/mobile/testing/installations/register", init: { method: "POST" } });
  });

  it("maps start / heartbeat / finish to their endpoints", async () => {
    set({ ok: true, duplicate: true, server_time: "2026-11-01T13:00:00Z" });
    const body = { installation_id: "i", event_id: "e", client_session_id: "s", occurred_at: "2026-11-01T13:00:00Z" };
    expect(await sendOne("foreground", body)).toEqual({ serverTime: "2026-11-01T13:00:00Z", duplicate: true });
    await sendOne("heartbeat", body);
    await sendOne("background", body);
    expect(calls.map((c) => c.path)).toEqual(["/mobile/testing/sessions/start", "/mobile/testing/sessions/heartbeat", "/mobile/testing/sessions/finish"]);
    expect(calls[0].init?.body).toEqual(body);
  });

  it("sends a batch without local-only fields and reads which events were accepted", async () => {
    set({ ok: true, accepted: 1, items: [{ event_id: "e1", duplicate: true }], server_time: "x" });
    const r = await sendBatch("inst", [{ event_id: "e1", client_session_id: "s", event_type: "foreground", occurred_at: "t", retries: 3, created_at: 1 }]);
    expect(r.accepted).toEqual(["e1"]);
    expect(calls[0].init?.body).toEqual({ installation_id: "inst", events: [{ event_id: "e1", client_session_id: "s", event_type: "foreground", occurred_at: "t" }] });
  });
});
