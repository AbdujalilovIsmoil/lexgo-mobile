import type { Command } from "@/entities/instructor";
import { findTarget, scrollToTarget, type TargetEntry } from "@/shared/instructor";
import { toast } from "@/shared/ui";
import { tr } from "../../lib/tr";
import { isLauncherTarget, selfHelpAsked } from "../../lib/selfHelp";
import { showStep } from "../overlayStore";
import { queueEvent } from "../events";
import { sleep, type RunCtx } from "./context";
import { markRunning, reportDone, reportMissing, reportSkipped } from "./report";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Wait until the element is mounted AND laid out (a screen that just opened registers its targets late).
async function waitForTarget(id: string, signal: AbortSignal, ms = 2600): Promise<TargetEntry | null> {
  const end = Date.now() + ms;
  while (Date.now() < end && !signal.aborted) {
    const t = findTarget(id);
    if (t && (await t.measure())) return t;
    await sleep(160, signal);
  }
  return null;
}

export type Pos = { index: number; total: number };

// scroll_to / highlight / tooltip / focus_input on a registered target. Returns false when the user stopped the tour.
export async function runTargetStep(c: Command, ctx: RunCtx, pos: Pos): Promise<boolean> {
  if (isLauncherTarget(c.target) && !selfHelpAsked(ctx.message)) {
    // Page-level hints ("ai-help:current-page") point at the assistant's own button: only a caption is shown.
    if (c.text && c.type === "tooltip") await showStep({ id: c.id, targetId: "", caption: c.text, mode: "tooltip", ...pos, holdMs: 5000 });
    reportSkipped(c, "self_target_blocked");
    return true;
  }
  markRunning(c);
  const t = await waitForTarget(c.target, ctx.signal);
  if (ctx.signal.aborted) return false;
  if (!t) {
    reportMissing(c);
    // The screen has not put this element on the map: keep the caption as a page-level hint instead of nothing.
    if (c.text && c.type !== "scroll_to" && c.type !== "focus_input") await showStep({ id: c.id, targetId: "", caption: c.text, mode: "tooltip", ...pos, holdMs: 5000 });
    else toast(tr("ax3.targetMissing"), "info");
    return true;
  }
  if (c.type === "focus_input") {
    t.focus?.();
    reportDone(c, { target_found: true, focused: !!t.focus });
    return true;
  }
  await scrollToTarget(c.target);
  reportDone(c, { target_found: true });
  if (c.type === "scroll_to") return true;
  const mode = c.type === "tooltip" ? "tooltip" : "highlight";
  const holdMs = clamp(c.durationMs || (mode === "tooltip" ? 5000 : 6000), 1800, 15_000);
  const outcome = await showStep({ id: c.id, targetId: c.target, caption: c.text || tr("ax3.here", { label: t.label }), mode, ...pos, holdMs });
  if (outcome !== "stop") return true;
  if (ctx.signal.aborted) return false;
  queueEvent({ event_type: "user_cancelled", command_id: c.id, command_type: c.type, reason: "user_stopped" });
  return false;
}
