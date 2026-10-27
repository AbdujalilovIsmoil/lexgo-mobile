import type { RaAck, RaMeta, RaSession } from "@/entities/remote-assist/model/types";
import type { RaTarget } from "@/shared/remote-assist/routes";
import type { RaControl, RaDone, RaResult } from "@/shared/remote-assist/types";

/** What the client is asked to confirm with their own tap: one action, a draft (label → value rows) or a final step to show. */
export type RaAsk = { kind: "action" | "draft" | "present"; label: string; actionId: string; rows: { label: string; value: string }[]; summary: string };

// Everything the executor reads or does, handed in by the runtime: the executor itself touches no screen, socket or store.
export type ExecCtx = {
  meta: RaMeta | null;
  session: RaSession | null;
  deviceOk: boolean; // the session was consented with this app run's device session id
  answered: (commandId: string) => boolean;
  now: number; // in server time (the phone's clock may run ahead or behind)
  page: { id: string; revision: number }; // the page in front and the revision its context began at
  control: (componentId: string) => RaControl | null;
  ask: (a: RaAsk) => Promise<boolean>; // resolves on the client's tap; confirmation_required is acknowledged once it is on screen
  navigate: (t: RaTarget) => Promise<RaDone>;
  mark: (c: RaControl, text: string, ms: number) => Promise<void>; // brought into view, then outlined for a bounded time
  reveal: (c: RaControl) => Promise<boolean>;
  sheetOpen: () => boolean; // a bottom sheet is up: iOS cannot present a second one beside it
};

export const reject = (code: string): RaAck => ({ status: "rejected", failureCode: code, result: { applied: false } });
export const declined = (): RaAck => ({ status: "cancelled", failureCode: "client_declined", result: { applied: false } });
export const done = (confirmed: boolean, result: RaResult = {}): RaAck => ({ status: confirmed ? "confirmed" : "executed", failureCode: "", result: { ...result, applied: true } });
export const settle = (d: RaDone, confirmed: boolean, extra: RaResult = {}): RaAck => (d.ok ? done(confirmed, { ...extra, ...d.result }) : reject(d.code));
