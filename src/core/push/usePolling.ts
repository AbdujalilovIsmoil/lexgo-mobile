import { useEffect } from "react";
import { useLocalPrefs } from "@/entities/notification";
import { useIsAuthed } from "@/entities/session";
import { usePermissionStore } from "@/shared/push";
import { disablePolling, enablePolling } from "./registerTask";

// The periodic check exists only while a user is signed in, the notification permission is granted
// and "background alerts" is on; signing out removes it.
export function usePolling(): void {
  const authed = useIsAuthed();
  const granted = usePermissionStore((s) => s.status === "granted");
  const wanted = useLocalPrefs((s) => s.background);
  useEffect(() => {
    if (authed && granted && wanted) void enablePolling();
    else void disablePolling();
  }, [authed, granted, wanted]);
}
