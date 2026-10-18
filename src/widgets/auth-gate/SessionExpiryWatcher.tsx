import { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useSessionStore } from "@/entities/session";

// The refresh endpoint said the session is dead (revoked or expired): the store signed out once with
// the "expired" notice; take the user to the sign-in screen, which shows that notice and clears it.
export function SessionExpiryWatcher() {
  const notice = useSessionStore((s) => s.notice);
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (notice === "sessionExpired" && !path.startsWith("/auth/login")) router.push("/auth/login");
  }, [notice, path, router]);
  return null;
}
