import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as ScreenCapture from "expo-screen-capture";
import { useLockStore } from "@/entities/session";
import { isAuthenticating, lockDue } from "@/entities/auth-lock";

// Raises the lock when the app comes back after `timeoutMin` in the background (0 = every time), and
// asks iOS to blur the app-switcher snapshot while the lock is on. The system biometric dialog makes
// the app "inactive" for a moment — that is not leaving the app.
export function useLockWatcher(): void {
  const enabled = useLockStore((s) => s.enabled);
  const timeoutMin = useLockStore((s) => s.timeoutMin);
  useEffect(() => {
    if (!enabled) return;
    let leftAt = 0;
    const sub = AppState.addEventListener("change", (state) => {
      if (isAuthenticating()) return;
      if (state === "background") leftAt = leftAt || Date.now();
      else if (state === "active") {
        if (lockDue(leftAt, Date.now(), timeoutMin)) useLockStore.getState().lock();
        leftAt = 0;
      }
    });
    return () => sub.remove();
  }, [enabled, timeoutMin]);

  useEffect(() => {
    if (!enabled || Platform.OS !== "ios") return;
    void ScreenCapture.enableAppSwitcherProtectionAsync(1).catch(() => {});
    return () => void ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
  }, [enabled]);
}
