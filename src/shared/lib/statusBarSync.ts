import { StatusBar } from "react-native";

type Internals = { _currentValues: unknown; _updatePropsStack?: () => void };

// React Native's <StatusBar> merges every mounted bar in JS and calls the native side only when the merged style
// CHANGED. The system resets the native style behind its back — the Face ID / passcode sheet, a return from the
// background, a dismissed native modal or picker (camera, scanner, files) — and the app then keeps the wrong icon
// colour (white icons on a white page) until some bar happens to change. This forgets the cached value and sends the
// current style again. A no-op if React Native ever drops these internals.
export function resyncStatusBar(): void {
  const sb = StatusBar as unknown as Internals;
  if (typeof sb._updatePropsStack !== "function") return;
  sb._currentValues = null;
  sb._updatePropsStack();
}

/** After a native sheet / picker finished animating away. */
export const resyncStatusBarSoon = (ms = 400): void => {
  setTimeout(resyncStatusBar, ms);
};
