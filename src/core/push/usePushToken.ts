import { useEffect } from "react";
import { useIsAuthed } from "@/entities/session";
import { forgetPushToken, registerPushToken, usePermissionStore } from "@/shared/push";

// Remote push registration, ready for the day the backend accepts a device token. While
// EXPO_PUBLIC_PUSH_TOKEN is off (the default) this does nothing at all.
export function usePushToken(): void {
  const authed = useIsAuthed();
  const granted = usePermissionStore((s) => s.status === "granted");
  useEffect(() => {
    if (authed && granted) void registerPushToken();
    if (!authed) void forgetPushToken();
  }, [authed, granted]);
}
