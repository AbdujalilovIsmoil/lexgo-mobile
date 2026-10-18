import { type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Scroll view for pages with a hero on top.
// - No bounce / overscroll stretch at either end: pulling down at the top never
//   drags the content.
// - Keyboard aware: a focused input scrolls into view above the keyboard on
//   both platforms, also with Android edge-to-edge.
export function HeroScroll(props: ScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
      bottomOffset={28}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}
