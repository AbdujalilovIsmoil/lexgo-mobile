import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Icon, Text } from "@/shared/ui";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { useAppActive } from "@/shared/lib/useAppActive";
import { useT } from "@/shared/i18n";

type Props = { x: SharedValue<number>; p: SharedValue<number>; w: number; onOpen: () => void; onClose: () => void };

let named = false;

// The tab on the left edge that opens the menu (touch area = the visible tab, 28 x 84 dp, so taps beside it never open it).
// It says it is pressable: a chevron on a bright tab, a "Menyu" label the first time, and every few seconds the tab slides out
// and back. Dragging it pulls the sidebar out under the finger; a tap opens it with a spring.
export function SidebarHandle({ x, p, w, onOpen, onClose }: Props) {
  const { t } = useT();
  const { height } = useWindowDimensions();
  const covered = useSheetsOpen((st) => st.n > 0);
  const front = useAppActive();
  const calm = useReducedMotion();
  const awake = front && !calm; // no tease timer while the app is in the background or motion is reduced
  const tease = useSharedValue(0);
  const label = useSharedValue(0);
  useEffect(() => {
    if (!awake) return;
    const nudge = () => { if (!covered) tease.value = withSequence(withTiming(12, { duration: 280 }), withDelay(220, withTiming(0, { duration: 340 }))); };
    const first = setTimeout(() => {
      nudge();
      if (!named && !covered) { named = true; label.value = withSequence(withTiming(1, { duration: 260 }), withDelay(3600, withTiming(0, { duration: 420 }))); }
    }, 1200);
    const loop = setInterval(nudge, 8000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [tease, label, covered, awake]);
  // The pan reports where the drawer was when it began, so it also works if the (invisible) handle is touched while the drawer is
  // open. A cancelled pan (the system's edge swipe, an interruption) settles by where the drawer is — it never stays half way.
  const from = useSharedValue(-w);
  const moved = useSharedValue(false); // the pan really started: a plain tap fails the pan too and must not settle anything
  /* eslint-disable react-hooks/immutability */
  const pan = Gesture.Pan().minDistance(12).activeOffsetX([-12, 12]).failOffsetY([-24, 24])
    .onBegin(() => { from.value = x.value; moved.value = false; })
    .onStart(() => { moved.value = true; })
    .onUpdate((e) => { x.value = Math.max(-w, Math.min(0, from.value + e.translationX)); })
    .onEnd((e, ok) => {
      if (!ok) return;
      if (x.value + e.velocityX * 0.15 > -w / 2) scheduleOnRN(onOpen); else scheduleOnRN(onClose);
    })
    .onFinalize((_, ok) => { if (!ok && moved.value) scheduleOnRN(x.value > -w / 2 ? onOpen : onClose); });
  const tap = Gesture.Tap().maxDistance(24).maxDuration(600).onEnd((_, ok) => { if (ok) scheduleOnRN(x.value > -w / 2 ? onClose : onOpen); }); // out of sight but still under the finger when the drawer is out: it closes it
  /* eslint-enable react-hooks/immutability */
  const style = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0, 0.12], [1, 0], Extrapolation.CLAMP), transform: [{ translateX: tease.value + Math.max(0, x.value + w) }] }));
  const tip = useAnimatedStyle(() => ({ opacity: Math.min(label.value, interpolate(p.value, [0, 0.12], [1, 0], Extrapolation.CLAMP)), transform: [{ translateX: tease.value + Math.max(0, x.value + w) }] }));
  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View accessible accessibilityRole="button" accessibilityLabel={t("ntd.sbOpen")} collapsable={false} style={[s.box, { top: height * 0.38 }, style]}>
          <View style={s.tab}><Icon name="chevron-right" size={20} tone="white" /><View style={s.grip} /></View>
        </Animated.View>
      </GestureDetector>
      <Animated.View pointerEvents="none" style={[s.tip, { top: height * 0.38 + 24 }, tip]}><Text variant="caption" weight="bold" tone="white">{t("ntd.sbHint")}</Text></Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  box: { position: "absolute", left: 0, width: 28, height: 84 },
  tab: { width: 26, height: 84, borderTopRightRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderLeftWidth: 0, borderColor: "rgba(255,255,255,0.5)", shadowColor: "#1668F0", shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  grip: { width: 3, height: 22, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.55)" },
  tip: { position: "absolute", left: 34, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(10,20,40,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
});
