import { ApiError } from "@/shared/api";
import { BACKOFF_MS, UsageEngine, type Account, type Deps } from "./engine";
import { EMPTY, type Persisted, type QueuedEvent, type Registration, type SendBody, type UsageConfig, type UsageEventType } from "./types";

const REG: Registration = { installation_key: "key-1", platform: "android", distribution_track: "closed", app_version: "1.1.0", version_code: 4, manufacturer: "Google", model: "Pixel 8", os_version: "15", locale: "uz" };
const ACC: Account = { userId: "u1", registration: REG };
const ON: UsageConfig = { enabled: true, platforms: ["android"], heartbeatSeconds: 60, staleSeconds: 180, offlineSyncDays: 7, batchMax: 500 };

type Sent = { type: UsageEventType; body: SendBody };

function rig(over: { config?: UsageConfig; stored?: Persisted; serverOffsetMs?: number } = {}) {
  let t = Date.parse("2026-11-01T13:00:00Z");
  const server = () => new Date(t + (over.serverOffsetMs ?? 0)).toISOString(); // the backend's own clock
  let n = 0;
  const timers: { fn: () => void; ms: number; at: number; id: number }[] = [];
  const sent: Sent[] = [];
  const batches: QueuedEvent[][] = [];
  const registrations: Registration[] = [];
  let disk: Persisted = over.stored ?? { ...EMPTY };
  const fail: { send?: (s: Sent) => unknown; batch?: () => unknown; register?: () => unknown } = {};
  const d: Deps = {
    now: () => t,
    uuid: () => `id-${++n}`,
    load: async () => JSON.parse(JSON.stringify(disk)) as Persisted,
    save: async (p) => { disk = JSON.parse(JSON.stringify(p)) as Persisted; },
    api: {
      config: async () => over.config ?? ON,
      register: async (r) => { const err = fail.register?.(); if (err) throw err; registrations.push(r); return { id: `inst-${registrations.length}`, heartbeatSeconds: 60 }; },
      send: async (type, body) => { const s = { type, body }; const err = fail.send?.(s); if (err) throw err; sent.push(s); return { serverTime: server(), duplicate: false }; },
      // A batch counts as its events, in order, in `sent` too: the tests read what reached the backend, whichever way it went.
      batch: async (id, events) => { const err = fail.batch?.(); if (err) throw err; batches.push(events); events.forEach((e) => sent.push({ type: e.event_type, body: { installation_id: id, event_id: e.event_id, client_session_id: e.client_session_id, occurred_at: e.occurred_at } })); return { serverTime: server(), accepted: events.map((e) => e.event_id) }; },
    },
    setTimer: (fn, ms) => { const h = { fn, ms, at: t + ms, id: ++n }; timers.push(h); return h; },
    clearTimer: (h) => { const i = timers.indexOf(h as (typeof timers)[number]); if (i >= 0) timers.splice(i, 1); },
    platform: "android",
  };
  const e = new UsageEngine(d);
  const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); await e.flush(); for (let i = 0; i < 20; i++) await Promise.resolve(); };
  // Advance the clock, firing the timers that come due (in order).
  const advance = async (ms: number) => {
    const end = t + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const next = timers[0];
      if (!next || next.at > end) break;
      timers.shift();
      t = next.at;
      next.fn();
      await settle();
    }
    t = end;
    await settle();
  };
  return { e, d, sent, batches, registrations, fail, timers, advance, settle, disk: () => disk };
}

describe("Play test usage analytics", () => {
  it("first authenticated launch registers one installation and starts one session", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.settle();
    expect(r.registrations).toHaveLength(1);
    expect(r.sent.map((s) => s.type)).toEqual(["foreground"]);
    expect(r.sent[0].body.installation_id).toBe("inst-1");
    expect(r.sent[0].body.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("reopening the app reuses the installation; a second foreground while active opens no new session", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.e.foreground(); // e.g. a screen change re-emits "active"
    await r.settle();
    expect(r.sent.filter((s) => s.type === "foreground")).toHaveLength(1);
    const again = rig({ stored: r.disk() });
    await again.e.setAccount(ACC);
    expect(again.registrations).toHaveLength(0); // same user + metadata: no new registration
  });

  it("an app update or another account re-registers", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.setAccount({ ...ACC, registration: { ...REG, app_version: "1.2.0", version_code: 5 } });
    await r.e.setAccount({ userId: "u2", registration: { ...REG, app_version: "1.2.0", version_code: 5 } });
    expect(r.registrations.map((x) => x.version_code)).toEqual([4, 5, 5]);
  });

  it("heartbeats every interval only while foreground; background sends one finish and stops them", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.advance(3 * 60_000 + 1000);
    expect(r.sent.map((s) => s.type)).toEqual(["foreground", "heartbeat", "heartbeat", "heartbeat"]);
    await r.e.background();
    await r.settle();
    await r.advance(10 * 60_000);
    expect(r.sent.map((s) => s.type)).toEqual(["foreground", "heartbeat", "heartbeat", "heartbeat", "background"]);
    const ids = new Set(r.sent.map((s) => s.body.client_session_id));
    expect(ids.size).toBe(1); // one client_session_id for start, heartbeats and finish
    expect(new Set(r.sent.map((s) => s.body.event_id)).size).toBe(5); // a fresh event_id each
  });

  it("each foreground after a background is a new session", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.e.background();
    await r.e.foreground();
    await r.settle();
    const sessions = r.sent.filter((s) => s.type === "foreground").map((s) => s.body.client_session_id);
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).not.toBe(sessions[1]);
  });

  it("queues before sign-in and sends after registration", async () => {
    const r = rig();
    await r.e.foreground();
    await r.settle();
    expect(r.sent).toHaveLength(0);
    expect(r.disk().queue.map((q) => q.event_type)).toEqual(["foreground"]);
    await r.e.setAccount(ACC);
    await r.settle();
    expect(r.sent.map((s) => s.type)).toEqual(["foreground"]);
    expect(r.disk().queue).toHaveLength(0);
  });

  it("offline use is kept on disk and sent later as one batch in order; nothing is lost on a restart", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    r.fail.send = () => new ApiError(0, "network_error");
    r.fail.batch = () => new ApiError(0, "network_error");
    await r.e.foreground();
    await r.advance(2 * 60_000 + 500);
    await r.e.background();
    await r.settle();
    expect(r.sent).toHaveLength(0);
    expect(r.disk().queue.map((q) => q.event_type)).toEqual(["foreground", "heartbeat", "heartbeat", "background"]);
    const restarted = rig({ stored: r.disk() }); // the app was killed while offline
    await restarted.e.setAccount(ACC);
    await restarted.settle();
    expect(restarted.batches).toHaveLength(1); // one batch, in chronological order
    expect(restarted.batches[0].map((x) => x.event_type)).toEqual(["foreground", "heartbeat", "heartbeat", "background"]);
    expect(restarted.disk().queue).toHaveLength(0);
  });

  it("retries with the 5 s → 15 s → 30 s → 1 min → 5 min backoff and never throws", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    let calls = 0;
    r.fail.send = () => { calls += 1; return new ApiError(502, "bad gateway"); };
    r.fail.batch = () => { calls += 1; return new ApiError(502, "bad gateway"); };
    await r.e.foreground();
    await r.settle();
    expect(calls).toBe(1);
    for (const ms of BACKOFF_MS) await r.advance(ms);
    expect(calls).toBe(1 + BACKOFF_MS.length);
    r.fail.send = undefined;
    r.fail.batch = undefined;
    await r.advance(BACKOFF_MS[BACKOFF_MS.length - 1]);
    expect(r.sent.map((s) => s.type)).toContain("foreground");
    expect(r.disk().queue).toHaveLength(0);
  });

  it("401 keeps the queue and retries", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    r.fail.send = () => new ApiError(401, "unauthorized");
    await r.e.foreground();
    await r.settle();
    expect(r.disk().queue).toHaveLength(1);
    r.fail.send = undefined;
    await r.advance(BACKOFF_MS[0]);
    expect(r.disk().queue).toHaveLength(0);
  });

  it("404 installation_not_found re-registers and retries with the new id", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    let once = true;
    r.fail.send = () => (once ? ((once = false), new ApiError(404, undefined, { code: "mobile_test_installation_not_found" })) : undefined);
    await r.e.foreground();
    await r.settle();
    expect(r.registrations).toHaveLength(2);
    expect(r.sent[0].body.installation_id).toBe("inst-2");
  });

  it("409 session_closed drops the event and continues in a new session", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.settle();
    const first = r.sent[0].body.client_session_id;
    r.fail.send = (s) => (s.body.client_session_id === first ? new ApiError(409, undefined, { code: "mobile_usage_session_closed" }) : undefined);
    await r.advance(60_000 + 10);
    const after = r.sent.slice(1);
    expect(after.map((s) => s.type)).toEqual(["foreground"]);
    expect(after[0].body.client_session_id).not.toBe(first);
    await r.advance(60_000);
    expect(r.sent[r.sent.length - 1].type).toBe("heartbeat");
    expect(r.sent[r.sent.length - 1].body.client_session_id).toBe(after[0].body.client_session_id);
  });

  it("409 event_id_conflict resends that row with a new event_id", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    let once = true;
    r.fail.send = () => (once ? ((once = false), new ApiError(409, undefined, { code: "mobile_usage_event_id_conflict" })) : undefined);
    await r.e.foreground();
    await r.settle();
    expect(r.sent).toHaveLength(1);
    expect(r.disk().queue).toHaveLength(0);
  });

  it("422 too_old / in_future / type_invalid drop the event without resending it", async () => {
    for (const code of ["mobile_usage_event_too_old", "mobile_usage_event_in_future", "mobile_usage_event_type_invalid"]) {
      const r = rig();
      await r.e.setAccount(ACC);
      let calls = 0;
      r.fail.send = () => { calls += 1; return new ApiError(422, undefined, { code }); };
      await r.e.foreground();
      await r.advance(10 * 60_000);
      expect(r.disk().queue.filter((q) => q.event_type === "foreground")).toHaveLength(0);
      expect(calls).toBeGreaterThan(0);
      expect(r.timers.filter((x) => x.ms === BACKOFF_MS[0])).toHaveLength(0); // no retry loop for it
    }
  });

  it("an event in the future adopts the server clock for new timestamps", async () => {
    const r = rig({ serverOffsetMs: -3_600_000 }); // the backend is one hour behind the phone
    await r.e.setAccount(ACC);
    const server = "2026-11-01T12:00:00.000Z";
    let once = true;
    const future = () => (once ? ((once = false), new ApiError(422, undefined, { code: "mobile_usage_event_in_future", data: { detail: { code: "mobile_usage_event_in_future", server_time: server } } })) : undefined);
    r.fail.send = future;
    r.fail.batch = future;
    await r.e.foreground();
    await r.settle(); // the start event is refused as "in the future": the engine adopts the server clock
    expect(r.e.state.skewMs).toBe(-3_600_000);
    await r.advance(60_000 + 1);
    const hb = r.sent.find((s) => s.type === "heartbeat");
    expect(hb && Date.parse(hb.body.occurred_at)).toBeLessThan(Date.parse("2026-11-01T12:30:00Z"));
  });

  it("503 analytics_disabled stops silently: no heartbeats, no retries", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    r.fail.send = () => new ApiError(503, undefined, { code: "mobile_test_analytics_disabled" });
    await r.e.foreground();
    await r.advance(5 * 60_000);
    expect(r.timers).toHaveLength(0);
  });

  it("config enabled=false (or another platform) does nothing at all", async () => {
    const off = rig({ config: { ...ON, enabled: false } });
    await off.e.setAccount(ACC);
    await off.e.foreground();
    await off.advance(5 * 60_000);
    expect(off.registrations).toHaveLength(0);
    expect(off.sent).toHaveLength(0);
    const ios = rig({ config: { ...ON, platforms: ["ios"] } });
    await ios.e.setAccount(ACC);
    await ios.e.foreground();
    await ios.settle();
    expect(ios.registrations).toHaveLength(0);
  });

  it("events older than the offline window are dropped before sending", async () => {
    const old: QueuedEvent = { event_id: "old", client_session_id: "s", event_type: "heartbeat", occurred_at: "2026-10-20T10:00:00.000Z", retries: 0, created_at: 0 };
    const r = rig({ stored: { ...EMPTY, queue: [old] } });
    await r.e.setAccount(ACC);
    await r.settle();
    expect(r.sent).toHaveLength(0);
    expect(r.disk().queue).toHaveLength(0);
  });

  it("the raw installation key never goes anywhere but the registration body", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.settle();
    expect(JSON.stringify(r.sent)).not.toContain("key-1");
    expect(JSON.stringify(r.disk())).not.toContain("key-1");
  });
});

describe("Play test usage analytics — one session, one heartbeat chain", () => {
  it("two foreground signals at the same moment open one session and one heartbeat timer", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await Promise.all([r.e.foreground(), r.e.foreground(), r.e.foreground()]);
    await r.settle();
    await r.advance(3 * 60_000 + 500);
    const types = r.sent.map((s) => s.type);
    expect(types.filter((x) => x === "foreground")).toHaveLength(1);
    expect(types.filter((x) => x === "heartbeat")).toHaveLength(3); // one per minute, never two
  });

  it("a foreground before sign-in and the sign-in itself still give one heartbeat per minute", async () => {
    const r = rig();
    await r.e.foreground();
    await r.e.setAccount(ACC);
    await r.settle();
    await r.advance(2 * 60_000 + 500);
    expect(r.sent.filter((s) => s.type === "heartbeat")).toHaveLength(2);
  });

  it("a disposed engine never fires again", async () => {
    const r = rig();
    await r.e.setAccount(ACC);
    await r.e.foreground();
    await r.settle();
    r.e.dispose();
    await r.advance(5 * 60_000);
    expect(r.sent.filter((s) => s.type === "heartbeat")).toHaveLength(0);
  });
});
