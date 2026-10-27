import { postRaState, RA_ERR, raErrorCode, raErrorComponents, raRetryAfter, type RaClientState, type RaElementWire, type RaSession } from "@/entities/remote-assist";
import { track } from "@/shared/analytics";
import { blockControl, claimedPage, openModal, raControls } from "@/shared/remote-assist/registry";
import { raPlaceOf } from "@/shared/remote-assist/routes";
import type { RaControl } from "@/shared/remote-assist/types";
import type { RaEnd } from "./store";
import type { Revision } from "./revision";

const LOOK = new Set(["element.highlight", "element.tooltip", "page.scroll_to"]);
export type RaView = { pageId: string; route: string; modal: string; elements: RaElementWire[] };

// A disabled control only allows looking at it; actions the contract does not know are never announced.
const actionsOf = (c: RaControl, known: Set<string> | null) =>
  c.actions.filter((a) => (c.state !== "disabled" || LOOK.has(a)) && (!known || known.has(a))).slice(0, 20);

/** The screen in front as the operator may see it (TZ RA §9): identity and coarse state only — a page without an adapter has no elements. */
export function readView(pathname: string, known: Set<string> | null): RaView {
  const place = raPlaceOf(pathname);
  const pageId = claimedPage() || place.pageId;
  const elements =
    pageId === "client.outside"
      ? []
      : raControls()
          .slice(0, 300)
          .map((c) => ({ component_id: c.id.slice(0, 200), label: c.label.slice(0, 200), actions: actionsOf(c, known), sensitivity: c.sensitivity, state: c.state }));
  return { pageId, route: place.route, modal: openModal(), elements };
}

export const signatureOf = (v: RaView): string => [v.pageId, v.route, v.modal, ...v.elements.map((e) => `${e.component_id}:${e.state}:${e.actions.join("+")}`)].join("|");

type Deps = {
  session: () => RaSession | null;
  device: string;
  pathname: () => string;
  known: () => Set<string> | null;
  rev: Revision;
  serverRev: () => number;
  send: (state: RaClientState) => boolean; // over the socket; false when it is not open
  end: (status: RaEnd) => void;
};

// Publishes the client state after consent, route / sheet / step changes, meaningful state changes and every command (§9): debounced,
// skipped when nothing changed, each one with a higher ui_revision. Socket first, HTTP when it is closed.
export function createPublisher(d: Deps) {
  let sig = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hold = 0; // remote_assist_rate_limit: nothing goes out before this time
  let last: RaView | null = null;
  const later = (ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => publish(false), Math.max(ms, hold - Date.now()));
  };
  const failed = (e: unknown): void => {
    const code = raErrorCode(e);
    if (code === RA_ERR.deviceMismatch) return d.end("revoked");
    if (code === RA_ERR.sessionExpired) return d.end("expired");
    sig = ""; // let the next change (or the retry below) go out again
    if (code === RA_ERR.revisionStale) {
      d.rev.skip();
      later(0);
    } else if (code === RA_ERR.rateLimit) {
      hold = Date.now() + Math.max(1, raRetryAfter(e) || 5) * 1000;
      later(0);
    } else if (code === RA_ERR.secretBlocked) {
      // §19: the component leaves the map, the event is reported (its id only), and the state goes out again without it
      for (const id of raErrorComponents(e)) {
        blockControl(id);
        track("action_failed", { action: "remote_assist_state", reason: "secret_component_blocked", target: id });
      }
      later(0);
    }
  };
  function publish(force: boolean): void {
    const s = d.session();
    if (!s || s.phase !== "active") return;
    if (Date.now() < hold) return later(0);
    clearTimeout(timer);
    const view = readView(d.pathname(), d.known());
    const next = signatureOf(view);
    last = view;
    if (!force && next === sig) return;
    sig = next;
    const ui = d.rev.next(d.serverRev(), `${view.pageId}|${view.route}|${view.modal}`);
    const body: RaClientState = { device_session_id: d.device, page_id: view.pageId.slice(0, 160), route: view.route || "/", ui_revision: ui, elements: view.elements };
    if (!d.send(body)) postRaState(s.id, body).catch(failed);
  }
  return {
    publish,
    soon: (ms = 400): void => later(ms),
    failed,
    /** The page last read (what the executor compares a command's page_id with). */
    view: (): RaView | null => last,
    stop: (): void => clearTimeout(timer),
  };
}

export type Publisher = ReturnType<typeof createPublisher>;
