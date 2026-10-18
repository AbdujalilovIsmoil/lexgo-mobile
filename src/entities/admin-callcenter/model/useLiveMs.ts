import { useIsFocused } from "expo-router";

// Polling interval that pauses while the console is not the visible screen (e.g. a chat room is open on top of it).
export function useLiveMs(ms: number): number | false {
  return useIsFocused() ? ms : false;
}
