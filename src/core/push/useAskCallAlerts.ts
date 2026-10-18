import { useEffect } from "react";
import { localPrefs, useLocalPrefs } from "@/entities/notification";
import { useIsAuthed } from "@/entities/session";
import { askPermission, usePushPermission } from "@/shared/push";

const ASK_EVERY = 3 * 86_400_000;

// A call that arrives while the app is in the background can only reach the person as a system notification, so the OS
// permission is asked a few seconds after a signed-in launch, at most once in 3 days while the OS still allows it (the notifications page and its card stay
// the way back for someone who said no). While the app is open the full-screen ring needs no permission.
export function useAskCallAlerts(): void {
  const authed = useIsAuthed();
  const perm = usePushPermission();
  const patch = useLocalPrefs((s) => s.patch);
  useEffect(() => {
    if (!authed || !perm.loaded || perm.status === "granted" || !perm.canAskAgain || Date.now() - localPrefs().askedAt < ASK_EVERY) return;
    const id = setTimeout(() => void askPermission().then(() => patch({ askedAt: Date.now() })), 5000);
    return () => clearTimeout(id);
  }, [authed, perm.loaded, perm.status, perm.canAskAgain, patch]);
}
