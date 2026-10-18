import { router } from "expo-router";
import type { Command } from "@/entities/instructor";
import { hrefAllowed, mobileRoute, usePathStore } from "@/shared/instructor";
import { activeContract } from "../contractRef";
import { closeInstructor, useInstructorUi } from "../uiStore";
import { sleep, waitFor, type RunCtx } from "./context";
import { markRunning, reportDone, reportFailed } from "./report";

// Open a screen of this app. The backend's portal href is mapped through an allowlist; the contract's
// allowed_routes must also permit it. Returns false when the run cannot continue on that screen.
export async function runNavigate(c: Command, ctx: RunCtx): Promise<boolean> {
  const contract = activeContract();
  const route = mobileRoute(c.href, contract?.routeAliases);
  if (!route || !hrefAllowed(c.href, contract?.allowedRoutes ?? [], contract?.routeAliases)) {
    reportFailed(c, "route_not_allowed");
    return false;
  }
  markRunning(c);
  if (usePathStore.getState().pathname === route) {
    reportDone(c, { already_there: true });
    return true;
  }
  if (useInstructorUi.getState().open) {
    closeInstructor();
    await sleep(380, ctx.signal);
  }
  router.navigate(route as never);
  if (!(await waitFor(() => usePathStore.getState().pathname === route, 3500, ctx.signal))) {
    reportFailed(c, ctx.signal.aborted ? "interrupted" : "navigation_failed");
    return false;
  }
  await sleep(450, ctx.signal); // let the new screen register its targets
  reportDone(c);
  return true;
}
