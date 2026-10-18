import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useT } from "@/shared/i18n";

const LETTERS = ["L", "e", "x", "G", "o"];

function Letter({ ch, i, word }: { ch: string; i: number; word: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, word.value * 1.7 - i * 0.2));
    return { opacity: p, transform: [{ translateY: (1 - p) * 22 }] };
  });
  return <Animated.Text style={[s.letter, i > 2 && s.accent, style]}>{ch}</Animated.Text>;
}

// "LexGo" letters rise in one by one, then the tagline fades in.
export function Wordmark({ word, tag }: { word: SharedValue<number>; tag: SharedValue<number> }) {
  const { t } = useT();
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        {LETTERS.map((ch, i) => (
          <Letter key={i} ch={ch} i={i} word={word} />
        ))}
      </View>
      <Animated.Text style={[s.tag, tagStyle]}>
        {t("home.heroLead")} {t("home.heroAccent")}
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10, marginTop: 18, paddingHorizontal: 24 },
  row: { flexDirection: "row" },
  letter: { fontFamily: "Onest_800ExtraBold", fontSize: 46, lineHeight: 52, letterSpacing: -1.5, color: "#FFFFFF" },
  accent: { color: "#5FD9FF" },
  tag: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#93C6FF", textAlign: "center" },
});
