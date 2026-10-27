type T = (key: string, params?: Record<string, string | number>) => string;

// Plain words for the contract's keys (scopes, modes, actions, pages). A key the app has no text for yet (a new scope from the
// backend) is shown readable instead of raw: "present_confirmation" → "present confirmation".
const keyOf = (s: string) => s.replace(/[^A-Za-z0-9_]+/g, "_");
const readable = (s: string) => s.replace(/^client\./, "").replace(/[._-]+/g, " ").trim();

function word(t: T, ns: string, raw: string): string {
  const k = `ra.${ns}.${keyOf(raw)}`;
  const v = t(k);
  return v === k ? readable(raw) : v;
}

export const scopeName = (t: T, scope: string) => word(t, "scopes", scope);
export const actionName = (t: T, action: string) => word(t, "actions", action);
export const pageName = (t: T, pageId: string) => word(t, "pages", pageId);

/** Title and description of a mode; an unknown mode gets the general wording. */
export function modeText(t: T, mode: string): { title: string; text: string } {
  const k = ["guide", "control", "prepare"].includes(mode) ? mode : "other";
  return { title: t(`ra.modes.${k}.title`), text: t(`ra.modes.${k}.text`) };
}
