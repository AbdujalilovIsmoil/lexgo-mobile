import { useMemo, type ReactNode } from "react";
import { Modal, Platform, StyleSheet, View } from "react-native";
import { initialWindowMetrics, SafeAreaInsetsContext, useSafeAreaInsets } from "react-native-safe-area-context";
import { OverlayHost } from "../overlay/OverlayHost";

// iOS: a sheet opened from a tab page inherits that page's bottom inset, which includes the tab bar (83pt, not the home indicator's 34)
// although the sheet covers the bar. The sheet's own bottom inset is capped to the one the window had at launch, before any tab bar.
function WindowInsets({ children }: { children: ReactNode }) {
  const cur = useSafeAreaInsets();
  const base = initialWindowMetrics?.insets.bottom;
  const insets = useMemo(() => (base == null ? cur : { ...cur, bottom: Math.min(cur.bottom, base) }), [cur, base]);
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>;
}

// A native Modal (covers the tab bar) or, inside a transparent route, a plain overlay. A native one hosts the
// confirm dialog and the toasts while it is the top-most surface (they would be hidden behind it otherwise).
// There is deliberately NO nested KeyboardProvider here: every provider owns a native keyboard
// callback and rewires the window-insets listener of the activity, so mounting and then
// unmounting one (opening and closing any sheet) left the app-level provider without keyboard
// events — the chat composer then stayed hidden behind the keyboard. The app-level provider
// already follows Android Modal windows by itself; the Modal is edge-to-edge on both bars.
export function SheetFrame({ native, onRequestClose, children }: { native: boolean; onRequestClose: () => void; children: ReactNode }) {
  if (!native) return <View style={StyleSheet.absoluteFill}>{children}</View>;
  const body = <>{children}<OverlayHost /></>;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onRequestClose}>
      {Platform.OS === "ios" ? <WindowInsets>{body}</WindowInsets> : body}
    </Modal>
  );
}
