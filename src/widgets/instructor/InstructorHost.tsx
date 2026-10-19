import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "expo-router";
import { useSession } from "@/entities/session";
import { useInstructorContract } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { subscribeTargets, targetsVersion, usePathStore } from "@/shared/instructor";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { abortRun, closeInstructor, ENGAGED_MS, queueEvent, scheduleRuntimeSync, setActiveContract, useInstructorRealtime, useInstructorUi, useOverlay } from "@/features/instructor";
import { HighlightOverlay } from "./HighlightOverlay";
import { InstructorLauncher } from "./InstructorLauncher";
import { InstructorSheet } from "./InstructorSheet";
import { hasTabBar, launcherHidden } from "./hiddenRoutes";
import { useKeyboardUp } from "./useKeyboardUp";

// Mounted ONCE in core. Tracks the screen, loads the contract, keeps the backend in sync while the assistant
// is in use, and renders the floating button, the sheet and the highlight overlay. Hidden for guests.
export function InstructorHost() {
  const session = useSession();
  const authed = !!session;
  const role = session?.user.role ?? "guest";
  const pathname = usePathname();
  const { locale } = useT();
  const insets = useInsets();
  const keyboard = useKeyboardUp();
  const open = useInstructorUi((s) => s.open);
  const guiding = useOverlay((o) => !!o.step);
  const contract = useInstructorContract(authed, session?.user.id ?? "");
  const version = useSyncExternalStore(subscribeTargets, targetsVersion);

  useEffect(() => usePathStore.getState().set(pathname, role), [pathname, role]);
  useEffect(() => setActiveContract(contract.data), [contract.data]);
  useInstructorRealtime(authed && !!contract.data);
  useEffect(() => {
    if (authed) scheduleRuntimeSync(locale, role);
  }, [authed, pathname, version, open, locale, role]);
  useEffect(() => {
    if (useOverlay.getState().step) abortRun("route_changed"); // a highlight belongs to the screen it was shown on
    if (Date.now() - useInstructorUi.getState().lastChat < ENGAGED_MS) queueEvent({ event_type: "route_changed" });
  }, [pathname]);
  useEffect(() => {
    if (authed) return;
    abortRun("logout");
    closeInstructor();
  }, [authed]);

  // The robot stays on screen while the contract loads, after a network/server failure and offline: only a clear
  // "not for this account" answer (403 / 404) removes it. Without a contract the runner simply skips navigation.
  const denied = contract.error instanceof ApiError && (contract.error.status === 403 || contract.error.status === 404);
  if (!authed || denied) return null;
  const hidden = launcherHidden(pathname) || keyboard || open || guiding;
  return (
    <>
      {hidden ? null : <InstructorLauncher base={insets.bottom + (hasTabBar(pathname) ? 104 : 24)} />}
      <InstructorSheet />
      <HighlightOverlay />
    </>
  );
}
