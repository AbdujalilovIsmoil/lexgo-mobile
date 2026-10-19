import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import { NavigationBar } from "expo-navigation-bar";
import { useTheme } from "@/shared/theme";
import { resyncStatusBar, resyncStatusBarSoon } from "@/shared/lib/statusBarSync";
import { useOverlayHosts } from "@/shared/ui/overlay";

// Edge-to-edge like iOS: the page colour is painted behind the status bar and
// the Android navigation bar, and screens keep clear of them with inset padding.
export function SystemChrome() {
  const { colors, dark } = useTheme();
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    if (Platform.OS !== "android") return;
    NavigationBar.setStyle(dark ? "dark" : "light");
  }, [colors.bg, dark]);
  // The system resets the status bar's icon colour behind React Native's back (Face ID / passcode prompt, return
  // from the background, a native modal closing): send the right one again at those moments.
  useEffect(() => {
    const app = AppState.addEventListener("change", (s) => {
      if (s === "active") resyncStatusBar();
    });
    let open = useOverlayHosts.getState().stack.length;
    const hosts = useOverlayHosts.subscribe((st) => {
      if (st.stack.length < open) resyncStatusBarSoon();
      open = st.stack.length;
    });
    return () => {
      app.remove();
      hosts();
    };
  }, []);
  return null;
}
