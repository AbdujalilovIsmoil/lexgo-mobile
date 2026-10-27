import type { RaMeta } from "../model/types";

// Scope and action rules read from GET /remote-assistance/meta (TZ RA §4–§6). Nothing here lists modes or actions of its own.
export const PERSONAL_SCOPE = "personal_form_fill";
export const BASE_SCOPE = "view_page_context"; // without it the operator sees nothing: part of every consent, not a toggle

// Actions that touch a field: on a personal field they also need the client's separate personal_form_fill consent (§4, §23).
const PERSONAL_ACTIONS = new Set(["form.set_value", "form.select_option", "form.toggle", "draft.prepare", "element.focus"]);
// Always shown to the client for their own tap, whatever the meta says (§4 prepare).
const ALWAYS_CONFIRM = new Set(["draft.prepare", "confirmation.present"]);

/** The actions the session allows: those of its mode whose scope (when they have one) the client granted. */
export function grantedActions(meta: RaMeta, mode: string, scopes: readonly string[]): Set<string> {
  const granted = new Set(scopes);
  return new Set(meta.actions.filter((a) => a.modes.includes(mode) && (!a.scope || granted.has(a.scope))).map((a) => a.id));
}

export const needsPersonalScope = (actionId: string): boolean => PERSONAL_ACTIONS.has(actionId);

/** True when the client must confirm before the command runs (§11). */
export function needsConfirm(meta: RaMeta, actionId: string, asked: boolean): boolean {
  return asked || ALWAYS_CONFIRM.has(actionId) || !!meta.actions.find((a) => a.id === actionId)?.confirm;
}

/** The scopes an accept grants: the base one plus every requested one the client left switched on. */
export const grantedScopes = (requested: readonly string[], off: ReadonlySet<string>): string[] =>
  [...new Set(requested)].filter((s) => s === BASE_SCOPE || !off.has(s)).slice(0, 20);
