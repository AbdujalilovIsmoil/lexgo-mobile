import { useEffect } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { usePreventScreenCapture } from "expo-screen-capture";
import type { Signal } from "@/shared/lib/signal";

const TAG = "pro-doc-editor";
const IDLE_MS = 5 * 60_000;

// Client documents are confidential: no screenshots / recents thumbnail of the editor in release builds.
function Protect() {
  usePreventScreenCapture(TAG);
  return null;
}

// The screen stays awake while the advocate works: until 5 minutes after the last touch or edit (`activity`), then the phone's own
// auto-lock applies again — a phone left on the desk with a document open no longer stays lit until the battery runs out.
export function ScreenGuard({ activity }: { activity: Signal }) {
  useEffect(() => {
    let awake = false;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const poke = () => {
      clearTimeout(idle);
      if (!awake) {
        awake = true;
        void activateKeepAwakeAsync(TAG).catch(() => undefined);
      }
      idle = setTimeout(() => {
        awake = false;
        void deactivateKeepAwake(TAG).catch(() => undefined);
      }, IDLE_MS);
    };
    poke();
    const off = activity.on(poke);
    return () => {
      off();
      clearTimeout(idle);
      if (awake) void deactivateKeepAwake(TAG).catch(() => undefined);
    };
  }, [activity]);
  return __DEV__ ? null : <Protect />;
}
