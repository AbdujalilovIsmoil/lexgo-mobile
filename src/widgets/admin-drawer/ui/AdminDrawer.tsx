import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useColors } from "@/shared/theme";
import { useDrawer } from "../model/drawerStore";
import { useDrawerMotion } from "../model/useDrawerMotion";
import { DrawerPanel } from "./DrawerPanel";

// Left-sliding module switcher: dark backdrop (tap closes), the panel (drag left closes), Android back closes.
export function AdminDrawer() {
  const c = useColors();
  const { width: W } = useWindowDimensions();
  const pw = Math.min(340, Math.round(W * 0.86));
  const shown = useDrawer((st) => st.open);
  const setOpen = useDrawer((st) => st.setOpen);
  const [mounted, setMounted] = useState(shown);
  const { x, gesture, open, close } = useDrawerMotion(pw, () => {
    setMounted(false);
    setOpen(false);
  });
  if (shown && !mounted) setMounted(true);
  useEffect(() => {
    if (!shown && mounted) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);
  useEffect(() => {
    if (mounted && shown) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  const dim = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-pw, 0], [0, 0.5], Extrapolation.CLAMP) }));
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <GestureHandlerRootView style={s.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, dim]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="close" />
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[s.panel, { width: pw, borderRightColor: c.line }, slide]}>
            <DrawerPanel onClose={close} />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  panel: { position: "absolute", left: 0, top: 0, bottom: 0, borderRightWidth: 1, overflow: "hidden" },
});
