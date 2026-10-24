import { useEffect, useState } from "react";
import { requireOptionalNativeModule } from "expo-modules-core";

type Native = {
  isCapturedAsync(): Promise<boolean>;
  addListener(event: "onCaptureChange", listener: (e: { captured?: boolean }) => void): { remove(): void };
};
// modules/screen-guard: iOS UIScreen.isCaptured (recording, mirroring, AirPlay), Android 15+ screen-recording callback.
const native = requireOptionalNativeModule<Native>("ScreenGuard");

/**
 * Calls `onChange` with whether the screen is being recorded or mirrored right now, and again whenever that changes. A build without
 * the native module (an older dev client) never reports a capture. Returns the unsubscribe.
 */
export function watchScreenCapture(onChange: (captured: boolean) => void): () => void {
  if (!native) return () => {};
  let heard = false; // an event that arrives before the first read is newer than it
  const sub = native.addListener("onCaptureChange", (e) => {
    heard = true;
    onChange(!!e.captured);
  });
  void native.isCapturedAsync().then((v) => !heard && onChange(!!v), () => undefined);
  return () => sub.remove();
}

/** Whether the screen is being recorded or mirrored right now (false while `enabled` is false). */
export function useScreenCaptured(enabled = true): boolean {
  const [captured, setCaptured] = useState(false);
  useEffect(() => (enabled ? watchScreenCapture(setCaptured) : undefined), [enabled]);
  return enabled && captured;
}
