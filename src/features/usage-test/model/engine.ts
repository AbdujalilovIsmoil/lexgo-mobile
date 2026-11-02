import { ApiError } from "@/shared/api";
import { DEFAULT_CONFIG, EMPTY, type BatchResult, type Persisted, type QueuedEvent, type Registration, type SendBody, type SendResult, type UsageConfig, type UsageEventType } from "./types";

// Everything the engine touches from outside, so it runs (and is tested) without React, timers or the network.
export type Deps = {
  now: () => number;
  uuid: () => string;
  load: () => Promise<Persisted>;
  save: (p: Persisted) => Promise<void>;
  api: {
    config: () => Promise<UsageConfig>;
    register: (r: Registration) => Promise<{ id: string; heartbeatSeconds: number }>;
    send: (type: UsageEventType, body: SendBody) => Promise<SendResult>;
    batch: (installationId: string, events: QueuedEvent[]) => Promise<BatchResult>;
  };
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (h: unknown) => void;
  platform: string;
};

// The signed-in tester and the installation's metadata; null = signed out (nothing is sent, the queue waits).
export type Account = { userId: string; registration: Registration };

// Retry after a network / 5xx / 401 failure: 5 s → 15 s → 30 s → 1 min → 5 min (then every 5 min).
export const BACKOFF_MS = [5_000, 15_000, 30_000, 60_000, 300_000];
const MAX_EVENT_RETRIES = 50; // a row that keeps failing for reasons we cannot see is eventually let go
const CONFIG_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_QUEUE = 5_000; // ~3.5 days of heartbeats: the oldest rows go first if the device stays offline that long

const codeOf = (e: unknown) => (e instanceof ApiError ? e.code ?? e.detail ?? "" : "");
const statusOf = (e: unknown) => (e instanceof ApiError ? e.status : 0);
const serverTimeOf = (e: unknown): string => {
  if (!(e instanceof ApiError)) return "";
  const inner = e.data?.detail && typeof e.data.detail === "object" ? (e.data.detail as Record<string, unknown>).server_time : undefined;
  return String(e.data?.server_time ?? inner ?? "");
};

// Foreground usage of the Play test build: one session per whole-app foreground (start → a heartbeat every N s → finish on background),
// every event written to the durable queue before it is sent, sent one by one or in batches, retried with backoff, idempotent by
// event_id on the backend. Any failure is silent: analytics never blocks or bothers the tester.
export class UsageEngine {
  private p: Persisted = { ...EMPTY };
  private ready: Promise<void>;
  private cfg: UsageConfig = DEFAULT_CONFIG;
  private cfgAt = 0;
  private cfgKnown = false;
  private account: Account | null = null;
  private session = ""; // client_session_id of the foreground session in progress
  private hb: unknown = null;
  private retry: unknown = null;
  private attempt = 0;
  private flushing: Promise<void> | null = null;
  private dirty = false; // something changed while a flush was running: run once more
  private saving: Promise<void> = Promise.resolve();
  private starting = false; // a foreground() is between its check and its session: a second call must not open another
  private disposed = false;

  constructor(private d: Deps) {
    this.ready = d.load().then((p) => { this.p = { ...EMPTY, ...p, queue: [...(p.queue ?? [])] }; }).catch(() => undefined);
  }

  // ---- public surface -------------------------------------------------------------------------------------------------------

  // Sign in / out or a change of the tester's metadata. Registration happens (again) when the user or any metadata changed.
  async setAccount(a: Account | null): Promise<void> {
    await this.ready;
    this.account = a;
    if (!a) return;
    if (!(await this.refreshConfig(true))) return;
    await this.ensureRegistered();
    void this.flush();
  }

  // The whole app came to the foreground: one new session (ignored if one is already running).
  async foreground(): Promise<void> {
    if (this.session || this.starting || this.disposed) return;
    this.starting = true;
    try {
      await this.ready;
      if (this.session) return;
      if (this.account && !(await this.refreshConfig(false))) return;
      if (this.cfgKnown && !this.cfg.enabled) return;
      this.session = this.d.uuid();
      await this.enqueue("foreground");
      this.startHeartbeat();
    } finally {
      this.starting = false;
    }
    void this.flush();
  }

  // Stops every timer for good (a replaced engine, e.g. after a code reload in development). The queue stays on disk.
  dispose(): void {
    this.disposed = true;
    this.stopHeartbeat();
    if (this.retry !== null) this.d.clearTimer(this.retry);
    this.retry = null;
  }

  // The whole app went to the background: finish the session and stop heartbeats.
  async background(): Promise<void> {
    await this.ready;
    this.stopHeartbeat();
    if (!this.session) return;
    await this.enqueue("background");
    this.session = "";
    void this.flush();
  }

  // Connectivity is back: send what waited.
  online(): void {
    void this.flush(true);
  }

  // ---- internals ------------------------------------------------------------------------------------------------------------

  get state() {
    return { ...this.p, session: this.session, config: this.cfg, heartbeat: !!this.hb, retryPending: !!this.retry };
  }

  private iso(): string {
    return new Date(this.d.now() + this.p.skewMs).toISOString();
  }

  private persist(): Promise<void> {
    const snap: Persisted = { ...this.p, queue: [...this.p.queue] };
    this.saving = this.saving.then(() => this.d.save(snap)).catch(() => undefined);
    return this.saving;
  }

  private async enqueue(type: UsageEventType): Promise<void> {
    this.p.queue.push({ event_id: this.d.uuid(), client_session_id: this.session, event_type: type, occurred_at: this.iso(), retries: 0, created_at: this.d.now() });
    if (this.p.queue.length > MAX_QUEUE) this.p.queue.splice(0, this.p.queue.length - MAX_QUEUE);
    await this.persist();
  }

  // Exactly one heartbeat chain at a time: every tick checks that it is still the current timer, so a chain that was replaced or
  // stopped can never fire again (and two chains can never run side by side).
  private startHeartbeat(): void {
    this.stopHeartbeat();
    const arm = () => {
      const h = this.d.setTimer(() => {
        if (this.hb !== h || this.disposed) return;
        arm();
        if (!this.session) return;
        void this.enqueue("heartbeat").then(() => this.flush());
      }, this.cfg.heartbeatSeconds * 1000);
      this.hb = h;
    };
    arm();
  }

  private stopHeartbeat(): void {
    if (this.hb !== null) this.d.clearTimer(this.hb);
    this.hb = null;
  }

  // Reads the config (on sign-in, and on foreground once it is older than a few hours or analytics was off). False = stop silently.
  private async refreshConfig(force: boolean): Promise<boolean> {
    const fresh = this.cfgKnown && this.d.now() - this.cfgAt < CONFIG_TTL_MS && this.cfg.enabled;
    if (!force && fresh) return true;
    try {
      this.cfg = await this.d.api.config();
      this.cfgAt = this.d.now();
      this.cfgKnown = true;
    } catch {
      return this.cfgKnown ? this.cfg.enabled : true; // unknown yet: keep queueing; the next try decides
    }
    const on = this.cfg.enabled && (!this.cfg.platforms.length || this.cfg.platforms.includes(this.d.platform));
    if (!on) {
      this.cfg = { ...this.cfg, enabled: false };
      this.stopHeartbeat();
      this.session = "";
    }
    return on;
  }

  // The user and the metadata, never the raw installation key (it must not reach the unencrypted store).
  private fingerprint(a: Account): string {
    const { installation_key: _key, ...meta } = a.registration;
    return JSON.stringify([a.userId, meta]);
  }

  private async ensureRegistered(): Promise<boolean> {
    const a = this.account;
    if (!a) return false;
    if (this.p.installationId && this.p.fingerprint === this.fingerprint(a)) return true;
    try {
      const r = await this.d.api.register(a.registration);
      if (!r.id) return false;
      this.p.installationId = r.id;
      this.p.fingerprint = this.fingerprint(a);
      if (r.heartbeatSeconds > 0 && r.heartbeatSeconds !== this.cfg.heartbeatSeconds) {
        this.cfg = { ...this.cfg, heartbeatSeconds: r.heartbeatSeconds };
        if (this.hb) this.startHeartbeat();
      }
      await this.persist();
      return true;
    } catch (e) {
      if (statusOf(e) === 503) this.cfg = { ...this.cfg, enabled: false };
      else this.scheduleRetry();
      return false;
    }
  }

  private dropOld(): void {
    const limit = this.d.now() + this.p.skewMs - this.cfg.offlineSyncDays * 86_400_000;
    this.p.queue = this.p.queue.filter((e) => Date.parse(e.occurred_at) >= limit && e.retries < MAX_EVENT_RETRIES);
  }

  private syncClock(serverTime: string): void {
    const t = Date.parse(serverTime);
    if (!Number.isNaN(t)) this.p.skewMs = Math.abs(t - this.d.now()) > 60_000 ? t - this.d.now() : 0;
  }

  private remove(ids: Set<string>): void {
    this.p.queue = this.p.queue.filter((e) => !ids.has(e.event_id));
  }

  flush(fromRetry = false): Promise<void> {
    if (fromRetry && this.retry !== null) { this.d.clearTimer(this.retry); this.retry = null; }
    if (!fromRetry && this.retry !== null) return Promise.resolve(); // backing off: the scheduled retry sends what is queued
    if (this.flushing) { this.dirty = true; return this.flushing; }
    this.flushing = this.drain().finally(() => {
      this.flushing = null;
      if (this.dirty) { this.dirty = false; void this.flush(); }
    });
    return this.flushing;
  }

  private async drain(): Promise<void> {
    await this.ready;
    if (!this.account || !this.cfg.enabled || !this.cfgKnown) return;
    if (!(await this.ensureRegistered())) return;
    const before = this.p.queue.length;
    this.dropOld();
    if (this.p.queue.length !== before) await this.persist();
    let reRegistered = false;
    while (this.p.queue.length) {
      const id = this.p.installationId;
      const head = this.p.queue.slice(0, Math.max(1, this.cfg.batchMax));
      try {
        if (head.length === 1) {
          const e = head[0];
          const r = await this.d.api.send(e.event_type, { installation_id: id, event_id: e.event_id, client_session_id: e.client_session_id, occurred_at: e.occurred_at });
          this.syncClock(r.serverTime);
          this.remove(new Set([e.event_id]));
        } else {
          const r = await this.d.api.batch(id, head);
          this.syncClock(r.serverTime);
          this.remove(new Set(r.accepted));
          if (!r.accepted.length) throw new ApiError(500, "batch_accepted_nothing");
        }
        this.attempt = 0;
        await this.persist();
      } catch (e) {
        const outcome = await this.onError(e, head, reRegistered);
        if (outcome === "reregistered") reRegistered = true;
        await this.persist();
        if (outcome === "stop") return;
      }
    }
  }

  // What to do with a failure. "continue": the queue changed, go on; "stop": wait (a retry is scheduled when it makes sense).
  private async onError(e: unknown, head: QueuedEvent[], reRegistered: boolean): Promise<"continue" | "stop" | "reregistered"> {
    const status = statusOf(e);
    const code = codeOf(e);
    if (status === 0 || status >= 500 && status !== 503 || status === 401 || status === 429) {
      head.forEach((x) => { x.retries += 1; });
      this.scheduleRetry();
      return "stop";
    }
    if (status === 503) { // mobile_test_analytics_disabled: silent until the config is read again
      this.cfg = { ...this.cfg, enabled: false };
      this.stopHeartbeat();
      return "stop";
    }
    if (status === 404 && code === "mobile_test_installation_not_found") {
      if (reRegistered) { this.scheduleRetry(); return "stop"; }
      this.p.installationId = "";
      this.p.fingerprint = "";
      return (await this.ensureRegistered()) ? "reregistered" : "stop";
    }
    if (head.length > 1) { // a batch refused as a whole: send its events one by one, so each gets its own answer
      return this.oneByOne(head);
    }
    const ev = head[0];
    if (code === "mobile_usage_event_id_conflict") {
      ev.event_id = this.d.uuid(); // a fresh id for this unsent row only
      return "continue";
    }
    if (code === "mobile_usage_session_closed") {
      this.remove(new Set([ev.event_id]));
      if (ev.client_session_id === this.session) this.restartSession();
      return "continue";
    }
    if (code === "mobile_usage_event_in_future") this.syncClock(serverTimeOf(e));
    // event_in_future, event_too_old, event_type_invalid or any other 4xx: this event can never succeed — drop it.
    this.remove(new Set([ev.event_id]));
    return "continue";
  }

  private async oneByOne(head: QueuedEvent[]): Promise<"continue" | "stop"> {
    for (const ev of head) {
      if (!this.p.queue.some((x) => x.event_id === ev.event_id)) continue;
      try {
        const r = await this.d.api.send(ev.event_type, { installation_id: this.p.installationId, event_id: ev.event_id, client_session_id: ev.client_session_id, occurred_at: ev.occurred_at });
        this.syncClock(r.serverTime);
        this.remove(new Set([ev.event_id]));
      } catch (err) {
        const o = await this.onError(err, [ev], true);
        if (o === "stop") return "stop";
      }
    }
    return "continue";
  }

  // The backend closed the session we are still in (stale after missed heartbeats): the rest of this foreground is a new session.
  private restartSession(): void {
    this.session = this.d.uuid();
    this.p.queue.push({ event_id: this.d.uuid(), client_session_id: this.session, event_type: "foreground", occurred_at: this.iso(), retries: 0, created_at: this.d.now() });
  }

  private scheduleRetry(): void {
    if (this.retry !== null) return;
    const ms = BACKOFF_MS[Math.min(this.attempt, BACKOFF_MS.length - 1)];
    this.attempt += 1;
    this.retry = this.d.setTimer(() => { this.retry = null; void this.flush(true); }, ms);
  }
}
