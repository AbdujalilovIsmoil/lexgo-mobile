import { confirmAction, previewAction, type ActionBody, type ActionPreview, type ActionResult, type Command } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { errText } from "../../lib/errText";
import { tr } from "../../lib/tr";
import { askConfirm } from "../askConfirm";
import { afterResult } from "./after";
import { abortReason, type RunCtx } from "./context";
import { dialogSpec } from "./dialogSpec";
import { actionOf, buildPayload } from "./payload";
import { markRunning, reportCancelled, reportDone, reportFailed } from "./report";

export type Outcome = { stop: boolean; more: Command[] };
const GO: Outcome = { stop: false, more: [] };
const LAPSED = /expire|token|muddat|eskir/i;
const lapsed = (e: unknown) => e instanceof ApiError && (e.status === 410 || ([400, 403, 409, 422].includes(e.status) && LAPSED.test(`${e.code ?? ""} ${e.detail ?? ""}`)));

// Runs INSIDE the dialog. An expired 15-minute token is refreshed once, silently; other errors show a toast
// and rethrow so the dialog stays open for a retry.
async function confirmOnce(c: Command, body: ActionBody, token: string): Promise<ActionResult> {
  const send = (t: string) => confirmAction({ ...body, confirm_token: t, idempotency_key: c.id });
  try {
    try {
      return await send(token);
    } catch (e) {
      if (!lapsed(e)) throw e;
      return await send((await previewAction(body)).confirmToken);
    }
  } catch (e) {
    toast(errText(e), "err");
    throw e;
  }
}

// payment / consent / delete / purchase / support: PREVIEW → native confirm dialog → only then CONFIRM.
// Without a confirm_token from the preview nothing is ever sent to /actions/confirm.
export async function runAction(c: Command, ctx: RunCtx): Promise<Outcome> {
  const action = actionOf(c);
  if (!action) {
    reportFailed(c, "missing_action");
    return GO;
  }
  markRunning(c);
  const body: ActionBody = { session_id: ctx.sessionId, command_id: c.id, action, ...(c.target ? { target: c.target } : {}), payload: buildPayload(c, ctx) };
  let preview: ActionPreview;
  try {
    preview = await previewAction(body);
  } catch (e) {
    toast(errText(e), "err");
    reportFailed(c, "preview_failed", { status: e instanceof ApiError ? e.status : 0 });
    return GO;
  }
  if (!preview.canExecute || !preview.confirmToken) {
    toast(preview.summary || tr("ax3.unavailable"), "info");
    reportFailed(c, "actions_unavailable");
    return GO;
  }
  const asked = await askConfirm(dialogSpec(preview, body), () => confirmOnce(c, body, preview.confirmToken));
  if (!asked.ok) {
    reportCancelled(c, ctx.signal.aborted ? abortReason() : "user_declined");
    return { stop: true, more: [] };
  }
  reportDone(c, { confirmed: true, result_ref: asked.value.resultRef || undefined, result_status: asked.value.status });
  return { stop: false, more: await afterResult(asked.value, ctx) };
}
