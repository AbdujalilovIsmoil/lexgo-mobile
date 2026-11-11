import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

type Props = { top: number; font: number; word: SharedValue<number>; exit: SharedValue<number> };

// "Tezkor / Himoya" under the mark: rises in after the mark settles and fades out
// quickly when the mark starts its zoom (it does not fly with it).
export function Wordmark({ top, font, word, exit }: Props) {
  const style = useAnimatedStyle(() => ({
    opacity: word.value * interpolate(exit.value, [0, 0.25], [1, 0], "clamp"),
    transform: [{ translateY: (1 - word.value) * 14 }],
  }));
  return (
    <View style={[s.wrap, { top }]} pointerEvents="none">
      <Animated.View style={style}>
        <Animated.Text style={[s.text, s.small, { fontSize: font, lineHeight: font * 1.25 }]}>Tezkor</Animated.Text>
        <Animated.Text style={[s.text, s.big, { fontSize: font * 1.7, lineHeight: font * 1.7 * 1.15 }]}>Himoya</Animated.Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  text: { fontFamily: "Onest_800ExtraBold", includeFontPadding: false },
  small: { color: "#FFFFFF" },
  big: { color: "#4E8DFF", marginTop: -2 },
});
