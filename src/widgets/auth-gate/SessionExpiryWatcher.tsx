import { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useSessionStore } from "@/entities/session";
import { useSplash } from "@/shared/lib/splash";

// The refresh endpoint said the session is dead (revoked or expired), or the account is one the app does not serve: the store
// signed out once with a notice; take the user to the sign-in screen, which shows that notice and clears it — once the intro is
// over (at start the check answers while the splash is still playing, and iOS would present the form above it).
export function SessionExpiryWatcher() {
  const notice = useSessionStore((s) => s.notice);
  const router = useRouter();
  const path = usePathname();
  const splashDone = useSplash((s) => s.done);
  useEffect(() => {
    if (splashDone && notice && !path.startsWith("/auth/login")) router.push("/auth/login");
  }, [splashDone, notice, path, router]);
  return null;
}
