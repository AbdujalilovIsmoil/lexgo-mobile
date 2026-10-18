import { useNetStore } from "./netStore";

// Rolling window of recent request round-trips (time to first byte, see shared/api onRoundTrip). The lower quartile above
// 4 s marks the link slow, below 2 s clears it (hysteresis keeps the banner from flickering). The lower quartile, not
// the median: a busy JS thread (Android, dev builds) only ever delays a response callback, while a really slow link
// slows every request, so the quickest ones tell the truth.
const SLOW_MS = 4000;
const OK_MS = 2000;
const recent: number[] = [];

export function noteLatency(ms: number): void {
  recent.push(ms);
  if (recent.length > 10) recent.shift();
  if (recent.length < 6) return;
  const median = [...recent].sort((a, b) => a - b)[recent.length >> 2];
  const { slow, online } = useNetStore.getState();
  if (online && !slow && median > SLOW_MS) useNetStore.setState({ slow: true });
  else if (slow && median < OK_MS) useNetStore.setState({ slow: false });
}

export const resetLatency = (): void => {
  recent.length = 0;
  useNetStore.setState({ slow: false });
};
