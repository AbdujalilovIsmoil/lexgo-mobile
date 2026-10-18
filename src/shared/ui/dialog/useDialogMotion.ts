import { useEffect, useState } from "react";
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { tapHaptic } from "@/shared/lib/haptics";

// Opening mounts at once (state derived while rendering); closing fades out first.
export function useDialogMotion(open: boolean) {
  const [shown, setShown] = useState(false);
  const p = useSharedValue(0);
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open) {
      tapHaptic();
      p.value = withSpring(1, { damping: 17, stiffness: 240 });
    } else if (shown) {
      p.value = withTiming(0, { duration: 160 }, (done) => done && scheduleOnRN(setShown, false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const dim = useAnimatedStyle(() => ({ opacity: p.value * 0.62 }));
  const card = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.4), transform: [{ scale: 0.9 + 0.1 * p.value }, { translateY: (1 - p.value) * 14 }] }));
  return { shown, dim, card };
}
