import { router } from "expo-router";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { raFail, raOk, raPlaceOf, type RaDone, type RaTarget } from "@/shared/remote-assist";
import { env } from "../model/env";

const CALL = "call/[roomId]";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A call screen is in the root stack (in front or under other screens): its LiveKit room lives as long as that screen does. */
export function callOpen(): boolean {
  const nav = env.nav;
  if (!nav?.isReady?.() || !nav.getRootState) return false;
  return asArr(asDict(nav.getRootState()).routes).some((r) => asStr(asDict(r).name) === CALL);
}

const here = (): string => raPlaceOf(env.pathname).route;

/**
 * route.navigate on this phone. Support happens during a call (/call/[roomId]) and the call drops when its screen unmounts, so while one
 * is open a stack screen is PUSHED over it (a push never unmounts what is below). A tab route needs the tab group, which in expo-router 57
 * means either a second tab group stacked over the call or unwinding the stack through it — so it is refused (route_blocked_during_call).
 * With a sheet open the new screen would open behind it: refused too (sheet_open).
 */
export async function raNavigate(t: RaTarget): Promise<RaDone> {
  if (here() === t.route) return raOk({ already_there: true });
  if (useSheetsOpen.getState().n > 0) return raFail("sheet_open");
  if (callOpen()) {
    if (t.tab) return raFail("route_blocked_during_call");
    router.push(t.href as never);
  } else {
    router.navigate(t.href as never);
  }
  for (let waited = 0; waited < 3500; waited += 100) {
    await sleep(100);
    if (here() === t.route) return raOk();
  }
  return raFail("navigation_failed");
}
