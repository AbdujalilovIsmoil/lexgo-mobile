import { useSocketState } from "@/shared/realtime";

// react-query `refetchInterval` for data that the user socket already pushes: no polling while the socket is online (TZ 37.6),
// a slow poll only while it is down.
export function useFallbackInterval(ms: number): number | false {
  return useSocketState() === "online" ? false : ms;
}
