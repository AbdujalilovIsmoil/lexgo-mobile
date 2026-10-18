import { useLockStore } from "@/entities/session";
import { AccountGate, SessionExpiryWatcher } from "@/widgets/auth-gate";
import { AppLock } from "@/widgets/auth-lock";

// App-level mount point of the Auth package: the biometric lock (above everything), the account-state
// gate (blocked / pending / deleted …) and the "session expired → sign in" watcher.
export function AuthMounts() {
  const locked = useLockStore((s) => s.enabled && s.locked);
  return (
    <>
      <SessionExpiryWatcher />
      <AccountGate suppressed={locked} />
      <AppLock />
    </>
  );
}
