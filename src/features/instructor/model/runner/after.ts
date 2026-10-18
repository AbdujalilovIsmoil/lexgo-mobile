import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ActionResult, Command } from "@/entities/instructor";
import { mobileRoute, usePathStore } from "@/shared/instructor";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { tr } from "../../lib/tr";
import { activeContract } from "../contractRef";
import { closeInstructor, useInstructorUi } from "../uiStore";
import { sleep, type RunCtx } from "./context";

// What happens AFTER a confirmed action: a payment is only OPENED (the provider page; the app never marks it
// paid), a ticket or `next` screen is shown, and follow-up commands are handed back to the runner.
export async function afterResult(r: ActionResult, ctx: RunCtx): Promise<Command[]> {
  successHaptic();
  toast(r.message || tr("ax3.actionDone"), "ok");
  const leave = async () => {
    if (!useInstructorUi.getState().open) return;
    closeInstructor();
    await sleep(380, ctx.signal);
  };
  if (/^https:\/\//i.test(r.paymentUrl)) {
    await leave();
    await WebBrowser.openBrowserAsync(r.paymentUrl).catch(() => undefined);
    return [];
  }
  const next = r.ticketId ? `/support/${r.ticketId}` : r.nextHref ? mobileRoute(r.nextHref, activeContract()?.routeAliases) : null;
  if (next && next !== usePathStore.getState().pathname) {
    await leave();
    router.navigate(next as never);
    await sleep(450, ctx.signal);
  }
  return r.commands;
}
