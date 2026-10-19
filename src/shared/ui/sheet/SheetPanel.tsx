import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector, GestureHandlerRootView, type GestureType } from "react-native-gesture-handler";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { SheetBackdrop } from "./SheetBackdrop";
import { SheetHeader } from "./SheetHeader";
import { useSheetFit } from "./SheetFitContext";

type Props = { h: SharedValue<number>; gesture: GestureType; low: number; onClose: () => void; title?: string; subtitle?: string; children: ReactNode };

const TOP_GAP = 10;

// The sheet itself. While the keyboard is up it rides on top of it and, if
// it would then reach past the status bar, shrinks to fit — so the field being
// typed in is never covered (on Android a Modal is its own window, which does
// not resize, and with edge-to-edge nothing pans for us).
export function SheetPanel({ h, gesture, low, onClose, title, subtitle, children }: Props) {
  const c = useColors();
  const insets = useInsets();
  const { height: H } = useWindowDimensions();
  const { height: kb } = useReanimatedKeyboardAnimation(); // 0 … -keyboardHeight
  const fit = useSheetFit();
  const room = H - insets.top - TOP_GAP;
  const sheet = useAnimatedStyle(() => ({
    height: Math.min(h.value, room + kb.value),
    transform: [{ translateY: kb.value }],
  }));
  return (
    <GestureHandlerRootView style={s.root}>
      <SheetBackdrop height={h} low={low} onPress={onClose} />
      <Animated.View accessibilityViewIsModal accessibilityLabel={title} onAccessibilityEscape={onClose} style={[s.sheet, { backgroundColor: c.surface, borderColor: c.line }, sheet]}>
        <GestureDetector gesture={gesture}>
          <View collapsable={false} onLayout={(e) => fit?.setHeader(e.nativeEvent.layout.height)}>
            <SheetHeader title={title} subtitle={subtitle} onClose={onClose} />
          </View>
        </GestureDetector>
        <View style={s.content} onLayout={(e) => fit?.setWrap(e.nativeEvent.layout.height)}>{children}</View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, overflow: "hidden" },
  content: { flex: 1 },
});
