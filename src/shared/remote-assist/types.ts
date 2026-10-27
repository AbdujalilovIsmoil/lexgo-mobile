// Remote assistance (TZ.md "Remote Assistance Frontend Integration Contract" §9, §21): what a screen puts on the operator's map.
// Only identity and coarse state ever leave the phone — never a field's value.
export type RaSensitivity = "normal" | "personal" | "secret";
export type RaState = "empty" | "filled" | "invalid" | "disabled" | "selected" | "unselected" | "loading" | "ready" | "hidden";
export type RaRect = { x: number; y: number; width: number; height: number };

/** A safe outcome of a control: what happened (no values) or a failure code for the command's acknowledgement. */
export type RaResult = Record<string, string | number | boolean>;
export type RaDone = { ok: true; result?: RaResult } | { ok: false; code: string };
type Maybe<T> = T | Promise<T>;

// What a screen declares for one control. `actions` are the semantic actions it allows; the capabilities below carry them out through
// the screen's own state (setState / react-hook-form), never by touching views. A final submit, a payment or a signature is never one of them.
export type RaControlSpec = {
  id: string;
  label: string;
  actions: readonly string[];
  sensitivity?: RaSensitivity;
  state?: RaState;
  focus?: () => void;
  setValue?: (value: string) => Maybe<RaDone>;
  select?: (value: string) => Maybe<RaDone>;
  toggle?: (on?: boolean) => Maybe<RaDone>;
  open?: () => Maybe<RaDone>; // modal.open: a sheet of this screen
  next?: () => Maybe<RaDone>; // step.next of a registered wizard, after its own validation
  back?: () => Maybe<RaDone>;
  editor?: (section: string) => Maybe<RaDone>; // editor.open / editor.highlight of a registered LexGo editor
  reveal?: () => void; // scrolls a virtualised row into view (a list knows its index)
};

/** A registered control as the executor reads it. */
export type RaControl = RaControlSpec & { sensitivity: RaSensitivity; state: RaState; measure: () => Promise<RaRect | null> };

// Action sets a control usually allows. The executor still intersects them with what the backend grants for the session's mode and scopes.
export const RA_VIEW = ["element.highlight", "element.tooltip", "page.scroll_to"] as const;
export const RA_FIELD = [...RA_VIEW, "element.focus", "form.set_value", "draft.prepare"] as const;
export const RA_PICK = [...RA_VIEW, "form.select_option"] as const;
export const RA_SWITCH = [...RA_VIEW, "form.toggle"] as const;
export const RA_OPENER = [...RA_VIEW, "modal.open"] as const;
export const RA_FINAL = [...RA_VIEW, "confirmation.present"] as const; // a final button: shown to the client, pressed only by them

export const raOk = (result?: RaResult): RaDone => ({ ok: true, result });
export const raFail = (code: string): RaDone => ({ ok: false, code });
