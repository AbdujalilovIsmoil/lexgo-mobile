import type { Command } from "@/entities/instructor";
import { isFinal } from "@/entities/instructor";
import { activeContract } from "../contractRef";
import { hideOverlay } from "../overlayStore";
import { runAction } from "./action";
import { beginRun, abortReason, sleep, type RunCtx } from "./context";
import { runFill } from "./fill";
import { runModal } from "./modal";
import { runNavigate } from "./navigate";
import { isMutating } from "./payload";
import { reportCancelled, reportDone, reportSkipped } from "./report";
import { runTargetStep } from "./targets";
import { closeInstructor, useInstructorUi } from "../uiStore";

const STEPS = ["scroll_to", "highlight", "tooltip", "focus_input"];
const SCREEN = [...STEPS, "navigate", "open_modal"];

// Execute the assistant's commands in order. Unknown types are ignored safely; a mutating action is ONLY ever
// previewed + confirmed by the user (action.ts); the run stops when the user stops it or a new run starts.
export async function runCommands(list: Command[], base: Omit<RunCtx, "signal">): Promise<void> {
  const queue = list.filter((c) => !isFinal(c.id));
  if (!queue.length) return;
  const ctrl = beginRun();
  const ctx: RunCtx = { ...base, signal: ctrl.signal };
  const contract = activeContract();
  const total = queue.filter((c) => STEPS.includes(c.type) && c.target).length;
  if (queue.some((c) => SCREEN.includes(c.type)) && useInstructorUi.getState().open) {
    closeInstructor();
    await sleep(380, ctx.signal);
  }
  let index = 0;
  let blocked = false;
  let why = "interrupted";
  for (let i = 0; i < queue.length && !ctx.signal.aborted; i++) {
    const c = queue[i];
    if (isFinal(c.id)) continue;
    if (blocked && STEPS.includes(c.type)) {
      reportCancelled(c, "route_not_allowed");
      continue;
    }
    if (contract?.commandTypes.length && !contract.commandTypes.includes(c.type)) {
      reportSkipped(c, "unsupported_command");
    } else if (c.type === "navigate") {
      blocked = !(await runNavigate(c, ctx));
    } else if (STEPS.includes(c.type)) {
      if (!(await runTargetStep(c, ctx, { index: ++index, total }))) {
        why = "user_stopped";
        break;
      }
    } else if (c.type === "open_modal") {
      await runModal(c, ctx);
    } else if (c.type === "fill_form") {
      await runFill(c, ctx);
    } else if (c.type === "show_steps") {
      reportDone(c);
    } else if (isMutating(c, contract?.mutatingActions ?? [])) {
      const out = await runAction(c, ctx);
      queue.splice(i + 1, 0, ...out.more);
      if (out.stop) {
        why = "user_declined";
        break;
      }
    } else {
      reportSkipped(c, "unsupported_command");
    }
  }
  for (const c of queue) if (!isFinal(c.id)) reportCancelled(c, ctx.signal.aborted ? abortReason() : why);
  hideOverlay();
}
