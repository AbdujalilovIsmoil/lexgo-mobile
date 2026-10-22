import { Platform, StyleSheet, View, type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { gradient } from "@/shared/theme";

// Scroll view for pages with a hero on top.
// - iOS keeps its rubber-band bounce at both ends. The hero is dark, so a pull at the top would show the page canvas above it: a cap in
//   the hero's top colour sits above the content and makes the hero seem to go on. Android has no bounce / overscroll stretch.
// - Keyboard aware: a focused input scrolls into view above the keyboard on
//   both platforms, also with Android edge-to-edge.
export function HeroScroll({ children, ...props }: ScrollViewProps) {
  const ios = Platform.OS === "ios";
  return (
    <KeyboardAwareScrollView
      bounces={ios}
      alwaysBounceVertical={false}
      overScrollMode="never"
      bottomOffset={28}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {ios ? <View pointerEvents="none" style={s.cap} /> : null}
      {children}
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  cap: { position: "absolute", top: -1600, left: 0, right: 0, height: 1600, backgroundColor: gradient.dark[0] },
});
