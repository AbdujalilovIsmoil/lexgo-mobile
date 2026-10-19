import { useEffect } from "react";
import { useIsAuthed } from "@/entities/session";
import { disablePolling, enablePolling } from "./registerTask";

// The periodic job exists while a user is signed in; signing out removes it. It does two things: the alert poll (which
// itself stays silent unless the permission is granted and "background alerts" is on) and the offline sync (outbox +
// cache refresh), which must run whatever the alert settings are.
export function usePolling(): void {
  const authed = useIsAuthed();
  useEffect(() => {
    if (authed) void enablePolling();
    else void disablePolling();
  }, [authed]);
}
