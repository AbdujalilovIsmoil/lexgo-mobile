import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useIsAuthed } from "@/entities/session";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { registerBeforeSignOut } from "@/shared/lib/sessionReset";
import { forgetPushToken, registerPushToken, usePermissionStore } from "@/shared/push";

// Remote push registration (POST /devices): after sign-in, when the notification permission is granted, when the OS rotates the token and
// when the language changes (the backend writes the alert text in the device's locale). Sign-out deletes the token on the backend (before the session is wiped).
export function usePushToken(): void {
  const authed = useIsAuthed();
  const granted = usePermissionStore((s) => s.status === "granted");
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    if (!authed || !granted) return;
    void registerPushToken();
    const sub = Notifications.addPushTokenListener((t) => void registerPushToken(typeof t.data === "string" ? t.data : undefined, true));
    return () => sub.remove();
  }, [authed, granted, locale]);
  useEffect(() => {
    if (!authed) return;
    return registerBeforeSignOut(forgetPushToken); // a deliberate sign-out deletes the token while the session still authorizes it
  }, [authed]);
}
