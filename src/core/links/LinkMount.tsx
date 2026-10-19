import { useEffect, useRef } from "react";
import { useRootNavigationState, useRouter } from "expo-router";
import { takePending, useOpenLink, usePendingLink, type LinkRequest } from "@/features/open-link";
import { useSplash } from "@/shared/lib/splash";

// DeepLinkRouter: opens the link that was queued by +native-intent (an external link) or by a
// notification tap while signed out. Signed out → the sign-in screen first, the link right after. Nothing opens while the
// intro is still playing (a link that launched the app waits for it).
export function LinkMount() {
  const router = useRouter();
  const splashDone = useSplash((s) => s.done);
  const ready = !!useRootNavigationState()?.key && splashDone;
  const request = usePendingLink((s) => s.request);
  const { open, viewer } = useOpenLink();
  const signedIn = viewer.signedIn;
  const asked = useRef<LinkRequest | null>(null);
  useEffect(() => {
    if (!ready || !request) return;
    if (!signedIn) {
      if (asked.current !== request) router.navigate("/auth/login");
      asked.current = request;
      return;
    }
    const req = takePending();
    if (req) void open(req, "external");
  }, [ready, request, signedIn, open, router]);
  return null;
}
