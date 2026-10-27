import { useEffect } from "react";
import { useNavigationContainerRef, usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ensureRaMeta, peekRaMeta, raEventOf, raSessionIdOf } from "@/entities/remote-assist";
import { useLockStore } from "@/entities/session";
import { registerBeforeSignOut } from "@/shared/lib/sessionReset";
import { useAppActive } from "@/shared/lib/useAppActive";
import { useResync, useUserEvents } from "@/shared/realtime";
import { onRaChange } from "@/shared/remote-assist/registry";
import { refreshRequests } from "./discovery";
import { env } from "./env";
import { revokeForSignOut } from "./lifecycle";
import { raRuntime } from "./runtime";
import { frameOf } from "./socket";

// Mounted once for a signed-in client (core/providers/mounts/RaMounts): reads the runtime contract once, finds consent requests (at start,
// on return to the app, after a reconnect, on remote_assist.requested) and feeds the running session the screen, the app state and the
// user-socket events that concern it. A deliberate sign-out revokes the session first.
export function useRaHost(): void {
  const qc = useQueryClient();
  const nav = useNavigationContainerRef();
  const pathname = usePathname();
  const active = useAppActive();
  const locked = useLockStore((s) => s.enabled && s.locked);

  useEffect(() => {
    env.on = true;
    env.nav = nav;
    env.meta = () => peekRaMeta(qc);
    env.loadMeta = () => ensureRaMeta(qc).catch(() => null);
    void env.loadMeta(); // §6: once after sign-in, kept for the session
    const offMap = onRaChange(() => raRuntime()?.mapChanged());
    const offSignOut = registerBeforeSignOut(revokeForSignOut);
    return () => {
      env.on = false;
      offMap();
      offSignOut();
      raRuntime()?.stop();
    };
  }, [qc, nav]);

  useEffect(() => {
    env.pathname = pathname;
    raRuntime()?.routeChanged();
  }, [pathname]);

  useEffect(() => {
    env.active = active;
    env.locked = locked;
    raRuntime()?.appChanged();
    if (active && !locked) void refreshRequests();
  }, [active, locked]);

  useResync(() => void refreshRequests());

  useUserEvents(["remote_assist.", "notification.created"], (e) => {
    if (!raEventOf(e)) return;
    const rt = raRuntime();
    const sid = raSessionIdOf(e);
    const f = e.event.startsWith("remote_assist.") ? frameOf(e) : null;
    if (rt && f && (!sid || sid === rt.id)) rt.onFrame(f);
    else void refreshRequests();
  });
}
