import { Modal, StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { OverlayHost } from "../overlay/OverlayHost";

// A native Modal (covers the tab bar) or, inside a transparent route, a plain overlay. A native one hosts the
// confirm dialog and the toasts while it is the top-most surface (they would be hidden behind it otherwise).
// There is deliberately NO nested KeyboardProvider here: every provider owns a native keyboard
// callback and rewires the window-insets listener of the activity, so mounting and then
// unmounting one (opening and closing any sheet) left the app-level provider without keyboard
// events — the chat composer then stayed hidden behind the keyboard. The app-level provider
// already follows Android Modal windows by itself; the Modal is edge-to-edge on both bars.
export function SheetFrame({ native, onRequestClose, children }: { native: boolean; onRequestClose: () => void; children: ReactNode }) {
  if (!native) return <View style={StyleSheet.absoluteFill}>{children}</View>;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onRequestClose}>
      {children}
      <OverlayHost />
    </Modal>
  );
}
