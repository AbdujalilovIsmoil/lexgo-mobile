import { useEffect, useRef } from "react";
import { AppState, Modal } from "react-native";
import { useLockStore } from "@/entities/session";
import { useLockWatcher, useUnlock } from "@/features/auth-lock";
import { LockScreen } from "./LockScreen";

// Biometric vault (TZ 1.3): tokens stay in SecureStore, this Modal hides the app on cold start and
// after the grace period in the background until the system prompt passes. It prompts by itself once
// each time the lock comes up (a cancelled prompt leaves the button).
export function AppLock() {
  useLockWatcher();
  const up = useLockStore((s) => s.enabled && s.locked);
  const unlock = useUnlock();
  const run = useRef(unlock.run);
  useEffect(() => {
    run.current = unlock.run;
  });
  useEffect(() => {
    if (!up) return;
    const h = setTimeout(() => AppState.currentState === "active" && void run.current(), 450);
    return () => clearTimeout(h);
  }, [up]);
  return (
    <Modal visible={up} animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
      <LockScreen unlock={unlock} />
    </Modal>
  );
}
