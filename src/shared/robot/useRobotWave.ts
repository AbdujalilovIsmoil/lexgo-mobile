import { useCallback, useRef } from "react";
import type { RobotHandle } from "./RobotView";

// Ref for a RobotView plus a `wave()` that makes it wave and runs `after` once the wave has started.
export function useRobotWave(after: () => void, delayMs = 450) {
  const ref = useRef<RobotHandle>(null);
  const wave = useCallback(() => {
    ref.current?.play("wave");
    setTimeout(after, delayMs);
  }, [after, delayMs]);
  return { ref, wave };
}
