import { ApiError } from "@/shared/api";
import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { findControl } from "@/shared/remote-assist/registry";
import { fullyInWindow } from "@/shared/remote-assist/measure";
import { scrollIntoView } from "@/shared/remote-assist/scroller";
import type { RaControl } from "@/shared/remote-assist/types";
import { ackBody, ackRa, getRaSession, listRaCommands, mergeSession, normCommand, normSession, RA_ERR, RA_SETTLED, raErrorCode, type RaAck, type RaCommand, type RaSession } from "@/entities/remote-assist";
import { raNavigate } from "../lib/nav";
import { createAcks } from "./acks";
import { answerAsk, askClient } from "./ask";
import { deviceSessionId } from "./device";
import { awake, env } from "./env";
import { execute } from "./executor";
import { clearMark, showMark } from "./mark";
import { createPublisher } from "./publish";
import { createQueue } from "./queue";
import { createRevision } from "./revision";
import { createRaSocket, type Check, type RaFrame } from "./socket";
import { showEnded, useRaStore, type RaEnd } from "./store";

const AWAY_MS = 30_000; // in the background the socket closes after this; the backend's idle pause (§22) then applies
const SETTLE_MS = 250; // a screen's own state update lands before the new state is read
const ASKED: RaAck = { status: "confirmation_required", failureCode: "", result: { presented: true } };
const END_EVENTS: Record<string, RaEnd> = {
  "remote_assist.revoked": "revoked",
  "remote_assist.emergency_revoked": "revoked",
  "remote_assist.ended": "ended",
  "remote_assist.expired": "expired",
  "remote_assist.consent_denied": "denied",
};
const endOf = (status: string): RaEnd => (status === "denied" || status === "expired" || status === "ended" ? status : "revoked");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The consented session on this phone (one at a time): its socket, the published state, the command queue and the acknowledgements.
function createRuntime(first: RaSession, device: string) {
  const id = first.id;
  let alive = true;
  let serverRev = first.clientUiRevision;
  let away: ReturnType<typeof setTimeout> | undefined;
  // How far this phone's clock runs ahead of the server's: a live command is created just before it arrives, so the smallest
  // "now − created_at" seen is the skew (plus the shortest delivery). Expiry is judged in server time — a 20 s command TTL must not
  // look spent on a phone whose clock is a minute off.
  let skew: number | null = null;
  const observe = (c: RaCommand) => {
    if (c.createdAt) skew = Math.min(skew ?? Infinity, Date.now() - c.createdAt);
  };
  const session = (): RaSession | null => {
    const s = useRaStore.getState().session;
    return alive && s?.id === id ? s : null;
  };
  const rev = createRevision();
  const socket = createRaSocket(id, { onFrame: (f) => onFrame(f), onOpen: (again) => void opened(again), check: () => refresh() });
  const acks = createAcks({
    socket: (cid, a) => socket.send({ event: "command.ack", payload: { command_id: cid, ...ackBody(device, a) } }),
    http: (cid, a) => ackRa(id, cid, device, a),
  });
  const pub = createPublisher({
    session,
    device,
    pathname: () => env.pathname,
    known: () => {
      const m = env.meta();
      return m ? new Set(m.actions.map((a) => a.id)) : null;
    },
    rev,
    serverRev: () => serverRev,
    send: (state) => socket.send({ event: "client.state", payload: state }),
    end,
  });
  const queue = createQueue({ canRun: () => session()?.phase === "active" && awake() && !socket.resyncing(), run, answered: acks.answered });

  function stop(): void {
    if (!alive) return;
    alive = false;
    clearTimeout(away);
    socket.stop();
    pub.stop();
    queue.clear();
    answerAsk(false);
    clearMark();
    if (current?.id === id) current = null;
  }

  /** The session is over (deny / revoke / end / expiry / another device): the UI closes at once and says so. */
  function end(status: RaEnd): void {
    if (!alive) return;
    stop();
    useRaStore.setState({ session: null });
    showEnded(status);
  }

  function merge(next: RaSession): void {
    const prev = session();
    if (!prev || next.id !== id) return;
    const s = mergeSession(prev, next);
    serverRev = Math.max(serverRev, s.clientUiRevision);
    if (s.phase === "closed") return end(endOf(s.status));
    useRaStore.setState({ session: s });
    if (prev.phase === s.phase) return;
    if (s.phase === "active") {
      pub.publish(true); // resumed: the operator sees the screen again
      queue.drain();
    } else {
      clearMark(); // paused: nothing runs, a confirmation still open is a "no"
      answerAsk(false);
    }
  }

  /** GET the session (also the first step of a reconnect): a closed or foreign session ends the UI. */
  async function refresh(): Promise<Check> {
    try {
      merge(await getRaSession(id));
      return alive ? "open" : "stop";
    } catch (e) {
      const code = raErrorCode(e);
      if (code === RA_ERR.sessionExpired) end("expired");
      else if (code === RA_ERR.deviceMismatch) end("revoked");
      else if (e instanceof ApiError && [403, 404, 410].includes(e.status)) end("ended");
      return alive ? "retry" : "stop";
    }
  }

  // The socket is open (again): read the commands it may have missed, publish a newer state, then run what is new (§12 reconnect order).
  async function opened(again: boolean): Promise<void> {
    const list = await listRaCommands(id).catch(() => [] as RaCommand[]);
    if (!alive) return;
    for (const c of list) if (acks.answered(c.id) && !RA_SETTLED.has(c.status)) void acks.resend(c.id).catch(() => undefined);
    pub.publish(again);
    queue.add(list);
  }

  function onError(data: Dict): void {
    const code = raErrorCode(data);
    if (code === RA_ERR.deviceMismatch) return end("revoked");
    if (code === RA_ERR.sessionExpired) return end("expired");
    if (code === RA_ERR.revisionStale || code === RA_ERR.rateLimit || code === RA_ERR.secretBlocked) return pub.failed(data);
    if (code === RA_ERR.commandExpired) void reloadCommands();
  }

  function onFrame(f: RaFrame): void {
    if (!alive) return;
    const e = f.event;
    if (e === "error") return onError(f.data);
    if (e === "remote_assist.command_requested") {
      const c = normCommand(f.data.command ?? f.data);
      observe(c);
      return queue.add([c]);
    }
    if (e === "remote_assist.client_state") {
      serverRev = Math.max(serverRev, asNum(f.data.ui_revision ?? f.data.client_ui_revision));
      return;
    }
    if (END_EVENTS[e]) return end(END_EVENTS[e]);
    if (e.startsWith("remote_assist.command_") || e === "remote_assist.requested") return; // our own answers coming back / a new request
    const s = asDict(f.data.session ?? f.raw.session);
    if (asStr(s.id)) merge(normSession(s));
    else if (e.startsWith("remote_assist.")) void refresh(); // connected, consent_granted, paused, resumed … without a session body
  }

  const reloadCommands = () => listRaCommands(id).then((l) => alive && queue.add(l)).catch(() => undefined);

  function ackFailed(e: unknown): void {
    const code = raErrorCode(e);
    if (code === RA_ERR.deviceMismatch) end("revoked");
    else if (code === RA_ERR.sessionExpired) end("expired");
  }

  async function reveal(c: RaControl): Promise<boolean> {
    const r = await c.measure();
    if (r && fullyInWindow(r)) return true;
    if (c.reveal) {
      c.reveal();
      await sleep(450);
      return true;
    }
    return r ? scrollIntoView(r) : false;
  }

  async function run(cmd: RaCommand): Promise<void> {
    pub.publish(false); // the command is checked against the screen as it is now
    const meta = env.meta() ?? (await env.loadMeta());
    const ack = await execute(cmd, {
      meta,
      session: session(),
      deviceOk: device === deviceSessionId(),
      answered: acks.answered,
      now: Date.now() - (skew ?? 0),
      page: { id: pub.view()?.pageId ?? "", revision: rev.page() },
      control: findControl,
      ask: (a) => askClient(a, () => void acks.send(cmd.id, ASKED).catch(ackFailed)),
      navigate: raNavigate,
      mark: async (c, text, ms) => {
        await reveal(c);
        if (alive) showMark(c.id, text, ms);
      },
      reveal,
      sheetOpen: () => useSheetsOpen.getState().n > 0,
    });
    if (!ack || !alive) return;
    if (ack.status === "executed" || ack.status === "confirmed") {
      await sleep(SETTLE_MS);
      pub.publish(true); // §20.9: the next UI revision, then the answer
    }
    await acks.send(cmd.id, ack).catch(ackFailed);
    if (ack.failureCode === "command_expired") void reloadCommands(); // §19: not run; the command state is read again
  }

  function appChanged(): void {
    clearTimeout(away);
    if (!env.active) {
      clearMark();
      away = setTimeout(() => socket.sleep(), AWAY_MS);
      return;
    }
    if (env.locked) return;
    const asleep = socket.resyncing();
    socket.wake(); // a closed socket reconnects through the session check
    if (!asleep) void refresh();
    pub.publish(true); // §22: the page state again after foregrounding
    queue.drain();
  }

  function routeChanged(): void {
    clearMark(); // an outline belongs to the screen it was drawn on
    pub.soon(250);
  }

  useRaStore.setState({ session: first, request: null, ended: null });
  socket.start();
  pub.publish(true); // after consent (HTTP until the socket is open)
  return { id, stop, end, merge, refresh: () => void refresh(), onFrame, appChanged, routeChanged, mapChanged: () => pub.soon(400) };
}

let current: ReturnType<typeof createRuntime> | null = null;

/** Starts the consented session (one at a time). */
export function startRuntime(s: RaSession, device: string): void {
  current?.stop();
  current = createRuntime(s, device);
}

export const raRuntime = () => current;

registerSessionReset(() => current?.stop());
