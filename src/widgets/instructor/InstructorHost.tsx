import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "expo-router";
import { useSession } from "@/entities/session";
import { useInstructorContract } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { subscribeTargets, targetsVersion, usePathStore } from "@/shared/instructor";
import { useT } from "@/shared/i18n";
import { abortRun, closeInstructor, ENGAGED_MS, queueEvent, scheduleRuntimeSync, setActiveContract, useInstructorRealtime, useInstructorUi, useOverlay } from "@/features/instructor";
import { HighlightOverlay } from "./HighlightOverlay";
import { InstructorSheet } from "./InstructorSheet";

// Mounted ONCE in core. Tracks the screen, loads the contract, keeps the backend in sync while the assistant
// is in use, and renders the sheet and the highlight overlay (it is opened from its own page; there is no floating robot). Hidden for guests.
export function InstructorHost() {
  const session = useSession();
  const authed = !!session;
  const role = session?.user.role ?? "guest";
  const pathname = usePathname();
  const { locale } = useT();
  const open = useInstructorUi((s) => s.open);
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

  // Only a clear "not for this account" answer (403 / 404) turns it off. Without a contract the runner simply skips navigation.
  const denied = contract.error instanceof ApiError && (contract.error.status === 403 || contract.error.status === 404);
  if (!authed || denied) return null;
  return (
    <>
      <InstructorSheet />
      <HighlightOverlay />
    </>
  );
}
