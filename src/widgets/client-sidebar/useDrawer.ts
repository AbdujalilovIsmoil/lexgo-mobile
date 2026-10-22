import { useEffect } from "react";
import { useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSidebar } from "./sidebarStore";

export const SPRING = { damping: 22, stiffness: 240, mass: 0.9 };

// One shared position for the handle, the dim layer and the panel: `x` runs from -w (closed) to 0 (open) and `p` is
// the same as 0..1. A drag writes to it directly, so everything follows the finger. The store's `open` flag is only a
// mirror of the position (true from the first pixel out until it is fully shut: the dim layer and the panel take touches for
// exactly that long, so nothing behind them is pressed while the drawer moves), and show / hide move the position; nothing
// reads `open` to move the drawer, so a single tap can never loop.
export function useDrawer(w: number) {
  const open = useSidebar((s) => s.open);
  const mirror = useSidebar((s) => s.mirror);
  const register = useSidebar((s) => s.register);
  const x = useSharedValue(-w);
  const p = useDerivedValue(() => 1 + x.value / w);
  useEffect(() => {
    // Reanimated shared values are mutated by design; the compiler rule cannot see that.
     
    register((o) => { x.value = withSpring(o ? 0 : -w, SPRING); });
    return () => register(null);
  }, [w, x, register]);
  useAnimatedReaction(
    () => x.value > -w + 2,
    (isOpen, was) => { if (was !== null && isOpen !== was) scheduleOnRN(mirror, isOpen); },
  );
  return { x, p, open };
}
