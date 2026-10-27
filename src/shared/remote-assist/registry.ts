import { sensitivityOf } from "./secret";
import type { RaControl, RaControlSpec, RaRect } from "./types";

// The operator's map of the screen in front: its page id and the controls it registered (TZ RA §9, §20.4). Screens register while they
// are focused, so the map always belongs to one screen. Secret controls are refused here, whatever a screen declares.
type Entry = { read: () => RaControlSpec; measure: () => Promise<RaRect | null> };

const entries = new Map<string, Entry>();
const pages: { id: string }[] = [];
const listeners = new Set<() => void>();
const blocked = new Set<string>(); // ids the backend called secret (remote_assist_secret_component_blocked): off the map for good

/** The backend refused a control as secret: it leaves the map and is never registered again in this app run. */
export function blockControl(id: string): void {
  if (!id || blocked.has(id)) return;
  blocked.add(id);
  raTouch();
}

/** Something on the map changed (a control came or went, a state moved): the publisher looks again. */
export function raTouch(): void {
  listeners.forEach((f) => f());
}

export function onRaChange(f: () => void): () => void {
  listeners.add(f);
  return () => void listeners.delete(f);
}

/** Puts a control on the map; the returned function takes it off again. A secret control is never registered. */
export function registerControl(entry: Entry): () => void {
  const spec = entry.read();
  if (!spec.id || sensitivityOf(spec.id, spec.label, spec.sensitivity) === "secret") {
    if (__DEV__ && spec.id) console.warn(`[ra] secret control not registered: ${spec.id}`);
    return () => undefined;
  }
  entries.set(spec.id, entry);
  raTouch();
  return () => {
    if (entries.get(spec.id) !== entry) return;
    entries.delete(spec.id);
    raTouch();
  };
}

function snapshot(e: Entry): RaControl | null {
  const s = e.read();
  const sensitivity = sensitivityOf(s.id, s.label, s.sensitivity);
  return sensitivity === "secret" || blocked.has(s.id) ? null : { ...s, sensitivity, state: s.state ?? "ready", measure: e.measure };
}

/** A control of the screen in front, resolved only through the map (TZ RA §20.4). */
export function findControl(id: string): RaControl | null {
  const e = entries.get(id);
  return e ? snapshot(e) : null;
}

export const raControls = (): RaControl[] => [...entries.values()].map(snapshot).filter((c): c is RaControl => !!c);

/** The focused screen names its page (`client.subscription` …); the last claim wins and a screen that blurs gives its claim back. */
export function claimPage(id: string): () => void {
  const claim = { id };
  pages.push(claim);
  raTouch();
  return () => {
    const i = pages.indexOf(claim);
    if (i < 0) return;
    pages.splice(i, 1);
    raTouch();
  };
}

export const claimedPage = (): string => pages[pages.length - 1]?.id ?? "";

/** The id of the screen's sheet that is open right now ("" for none): part of the page context the operator acted on. */
export const openModal = (): string => raControls().find((c) => !!c.open && c.state === "selected")?.id ?? "";
