import { useNetStore, type NetKind } from "./netStore";

export type NetworkInfo = { online: boolean; kind: NetKind; slow: boolean; serverDown: boolean; offlineSince: number };

// Reactive connectivity for screens: `online` is false in airplane mode / no signal.
export function useNetwork(): NetworkInfo {
  const online = useNetStore((s) => s.online);
  const kind = useNetStore((s) => s.kind);
  const slow = useNetStore((s) => s.slow);
  const serverDown = useNetStore((s) => s.serverDown);
  const offlineSince = useNetStore((s) => s.offlineSince);
  return { online, kind, slow, serverDown, offlineSince };
}

export const useIsOnline = (): boolean => useNetStore((s) => s.online);
