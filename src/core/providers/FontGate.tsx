import { useEffect, useState, type ReactNode } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Onest_700Bold, Onest_800ExtraBold } from "@expo-google-fonts/onest";
import { useSessionStore, bindSessionToHttp } from "@/entities/session";
import { AnimatedSplash } from "@/widgets/splash";
import { useSplash } from "@/shared/lib/splash";

// Wire the HTTP layer to the session store once, before anything can fetch.
bindSessionToHttp();

// The animated Skia intro is the only splash: it is drawn from the very first
// JS frame (the native splash is a plain dark colour, no static logo) and
// stays until fonts and the stored session are ready — the full intro on a plain
// start, only until ready when the app was opened by a link or a notification.
export function FontGate({ children }: { children: ReactNode }) {
  const [fontsReady, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Onest_700Bold, Onest_800ExtraBold });
  const sessionReady = useSessionStore((s) => s.ready);
  const hydrate = useSessionStore((s) => s.hydrate);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    void hydrate();
    void SplashScreen.hideAsync().catch(() => {});
    if (Notifications.getLastNotificationResponse()) useSplash.getState().hurry(); // opened by a notification tap: show it, not the intro
  }, [hydrate]);

  const ready = (fontsReady || !!fontError) && sessionReady;
  return (
    <>
      {ready ? children : null}
      {intro ? <AnimatedSplash ready={ready} onDone={() => { setIntro(false); useSplash.getState().finish(); }} /> : null}
    </>
  );
}
