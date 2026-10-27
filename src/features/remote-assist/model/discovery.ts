import { listRaPending } from "@/entities/remote-assist";
import { useSessionStore } from "@/entities/session";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { env } from "./env";
import { useRaStore } from "./store";

const closed = new Set<string>(); // requests answered, expired or gone here: never shown again
let wanted = ""; // the request a notification tap asked for
let running: Promise<void> | null = null;
let again = false;

// The pending list is the caller's own (the backend scopes it to this client) and only holds live requests, so neither the user nor the
// phone's clock (which may run ahead) filters it here.
async function load(): Promise<void> {
  try {
    const page = await listRaPending();
    if (useRaStore.getState().session || !useSessionStore.getState().session) return;
    const open = page.items.filter((s) => s.phase === "pending" && !closed.has(s.id));
    const cur = useRaStore.getState().request;
    const pick = open.find((s) => s.id === wanted) ?? open.find((s) => s.id === cur?.id) ?? open[0] ?? null;
    if (pick && pick.id === wanted) wanted = "";
    useRaStore.setState({ request: pick && cur?.id === pick.id ? cur : pick, more: Math.max(0, open.length - 1), failed: cur?.id === pick?.id && useRaStore.getState().failed });
  } catch {
    /* read again on the next event, return to the app or reconnect */
  }
}

/**
 * GET /remote-assistance/sessions/pending (TZ RA §8): the consent request to show — the one a tap asked for, else the oldest waiting.
 * Runs at start, on every return to the app, after a socket reconnect and on remote_assist.requested; never while a session is on.
 */
export function refreshRequests(): Promise<void> {
  if (!env.on || useRaStore.getState().session) return Promise.resolve();
  if (running) {
    again = true;
    return running;
  }
  running = load().finally(() => {
    running = null;
    if (again) {
      again = false;
      void refreshRequests();
    }
  });
  return running;
}

/** A notification tap: show this request (once the host is up and it is still waiting). */
export function askFor(sessionId: string): void {
  if (sessionId) wanted = sessionId;
  void refreshRequests();
}

/** The request was answered or ran out: it is not offered again. */
export function closeRequest(id: string): void {
  closed.add(id);
  if (useRaStore.getState().request?.id === id) useRaStore.setState({ request: null, failed: false });
}

registerSessionReset(() => {
  closed.clear();
  wanted = "";
});
