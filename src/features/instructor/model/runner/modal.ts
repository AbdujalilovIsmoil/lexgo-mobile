import type { Command } from "@/entities/instructor";
import { openRegisteredModal } from "@/shared/instructor";
import { closeInstructor, useInstructorUi } from "../uiStore";
import { sleep, type RunCtx } from "./context";
import { markRunning, reportDone, reportFailed, reportMissing } from "./report";

// open_modal: only sheets/dialogs a screen registered (useInstructorModal) can be opened.
export async function runModal(c: Command, ctx: RunCtx): Promise<void> {
  const id = c.modal || c.target;
  if (!id) return void reportFailed(c, "missing_target");
  markRunning(c);
  if (useInstructorUi.getState().open) {
    closeInstructor();
    await sleep(380, ctx.signal);
  }
  if (!openRegisteredModal(id)) return void reportMissing(c, "no_opener");
  await sleep(320, ctx.signal);
  reportDone(c, { target_found: true });
}
