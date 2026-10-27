import { grantedActions, needsConfirm, needsPersonalScope, PERSONAL_SCOPE } from "@/entities/remote-assist/lib/scopes";
import type { RaAck, RaCommand } from "@/entities/remote-assist/model/types";
import { raTarget } from "@/shared/remote-assist/routes";
import { declined, done, reject, type ExecCtx } from "./execTypes";
import { runAction, runDraft } from "./runAction";

// Actions that only point at a control: allowed on a disabled one.
const LOOK = new Set(["element.highlight", "element.tooltip", "page.scroll_to"]);
const hasValues = (c: RaCommand) => !!c.payload.values && typeof c.payload.values === "object" && !Array.isArray(c.payload.values);

/**
 * The one place a command is checked and carried out (TZ RA §20), in the contract's order: live session on this device session →
 * not handled before → page and UI revision → resolved through the registered map → the control still allows the action → secret /
 * personal rules → the screen's own state and validation. Returns the acknowledgement, or null for a command already answered (it is
 * never run or answered twice). Publishing and acknowledging are the caller's (§20.9–10).
 */
export async function execute(cmd: RaCommand, x: ExecCtx): Promise<RaAck | null> {
  // 1. an active session, consented on this device session
  if (!x.session || x.session.phase !== "active") return reject("session_not_active");
  if (!x.deviceOk) return reject("device_session_mismatch");
  // 2. idempotency, freshness, and an action the session's mode and scopes grant
  if (x.answered(cmd.id)) return null;
  if (cmd.expiresAt && cmd.expiresAt <= x.now) return reject("command_expired");
  if (!x.meta) return reject("meta_unavailable");
  const action = x.meta.actions.find((a) => a.id === cmd.actionId);
  if (!action) return reject("unknown_action");
  if (!grantedActions(x.meta, x.session.mode, x.session.grantedScopes).has(action.id)) return reject("action_not_granted");
  const confirm = needsConfirm(x.meta, action.id, cmd.requiresConfirmation);
  if (action.id === "route.navigate") {
    // only a route of the app's own allowlist, wherever the client is now
    const t = raTarget(cmd.payload.route);
    if (!t) return reject("route_not_allowed");
    if (confirm && !(await x.ask({ kind: "action", label: t.pageId, actionId: action.id, rows: [], summary: "" }))) return declined();
    const d = await x.navigate(t).catch(() => null);
    return !d ? reject("execution_failed") : d.ok ? done(confirm, { page_id: t.pageId, ...d.result }) : reject(d.code);
  }
  // 3. the page and the UI revision the operator acted on; a screen outside the registry has no controls to act on
  if (x.page.id === "client.outside") return reject("page_not_registered");
  if (cmd.pageId && cmd.pageId !== x.page.id) return reject("page_changed");
  if (cmd.expectedUiRevision && cmd.expectedUiRevision < x.page.revision) return reject("ui_revision_conflict");
  if (action.id === "draft.prepare" && hasValues(cmd)) return runDraft(cmd, x).catch(() => reject("execution_failed"));
  // 4. only through the registered map
  if (!cmd.componentId) return reject("component_required");
  const c = x.control(cmd.componentId);
  if (!c || c.state === "hidden") return reject("component_not_mounted");
  // 5. the control still allows this action
  if (!c.actions.includes(action.id)) return reject("action_not_permitted");
  if (c.state === "disabled" && !LOOK.has(action.id)) return reject("component_disabled");
  // 6. secret controls never, personal ones only with the separate consent
  if (c.sensitivity === "secret") return reject("secret_component_blocked");
  if (c.sensitivity === "personal" && needsPersonalScope(action.id) && !x.session.grantedScopes.includes(PERSONAL_SCOPE)) return reject("personal_scope_required");
  // 7–8. through the screen's own state and validation
  try {
    return await runAction(cmd, c, x, confirm);
  } catch {
    return reject("execution_failed");
  }
}
