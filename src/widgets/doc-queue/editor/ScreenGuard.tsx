import { useKeepAwake } from "expo-keep-awake";
import { usePreventScreenCapture } from "expo-screen-capture";

// Client documents are confidential: no screenshots / recents thumbnail of the editor in release builds,
// and the screen stays awake while the advocate works.
function Protect() {
  usePreventScreenCapture("pro-doc-editor");
  return null;
}
export function ScreenGuard() {
  useKeepAwake("pro-doc-editor");
  return __DEV__ ? null : <Protect />;
}
