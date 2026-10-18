import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from "react-native-reanimated";
import { shadows } from "@/shared/theme";

const PAD = 4;
const GAP = 4;
// Slightly overdamped: the thumb glides in and stops, never poking out of the track.
const SPRING = { damping: 34, stiffness: 300, mass: 0.8 };

// The thumb position (in segment units) so labels can colour themselves as it passes.
const PosCtx = createContext<SharedValue<number> | null>(null);
export const useSegmentPos = () => useContext(PosCtx);

type Props = { count: number; index: number; track: string; thumb: string; thumbBorder?: string; radius: number; children: ReactNode };

// Track of `count` equal segments with one thumb that glides to the active one
// (spring) instead of jumping. Segments are passed as children (flex: 1 each).
export function SegmentTrack({ count, index, track, thumb, thumbBorder, radius, children }: Props) {
  const [w, setW] = useState(0);
  const x = useSharedValue(Math.max(0, index));
  useEffect(() => {
    x.value = withSpring(Math.max(0, index), SPRING);
  }, [index, x]);
  const seg = w ? (w - PAD * 2 - GAP * (count - 1)) / count : 0;
  const thumbStyle = useAnimatedStyle(() => ({ width: seg, transform: [{ translateX: x.value * (seg + GAP) }] }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.track, { backgroundColor: track, borderRadius: radius }]}>
      {seg > 0 && index >= 0 ? <Animated.View pointerEvents="none" style={[s.thumb, shadows.s1, { backgroundColor: thumb, borderColor: thumbBorder ?? thumb, borderRadius: radius - PAD / 2 }, thumbStyle]} /> : null}
      <PosCtx.Provider value={x}>{children}</PosCtx.Provider>
    </View>
  );
}

const s = StyleSheet.create({
  track: { flexDirection: "row", padding: PAD, gap: GAP },
  thumb: { position: "absolute", top: PAD, bottom: PAD, left: PAD, borderWidth: 1 },
});
