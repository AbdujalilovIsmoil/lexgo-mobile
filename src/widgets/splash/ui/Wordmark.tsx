import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useT } from "@/shared/i18n";

// "Tezkor Himoya" on two lines: the name is too long for one line at this size on a phone.
const WORDS = ["Tezkor", "Himoya"];

function Letter({ ch, i, word, accent }: { ch: string; i: number; word: SharedValue<number>; accent: boolean }) {
  const style = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, word.value * 1.7 - i * 0.1));
    return { opacity: p, transform: [{ translateY: (1 - p) * 22 }] };
  });
  return <Animated.Text style={[s.letter, accent && s.accent, style]}>{ch}</Animated.Text>;
}

// The two words' letters rise in one by one, then the tagline fades in.
export function Wordmark({ word, tag }: { word: SharedValue<number>; tag: SharedValue<number> }) {
  const { t } = useT();
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));
  let index = 0;
  return (
    <View style={s.wrap}>
      <View style={s.col}>
        {WORDS.map((w, wi) => (
          <View key={w} style={s.row}>
            {w.split("").map((ch) => (
              <Letter key={index} ch={ch} i={index++} word={word} accent={wi === 1} />
            ))}
          </View>
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
  col: { alignItems: "center" },
  row: { flexDirection: "row" },
  letter: { fontFamily: "Onest_800ExtraBold", fontSize: 46, lineHeight: 52, letterSpacing: -1.5, color: "#FFFFFF" },
  accent: { color: "#5FD9FF" },
  tag: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#93C6FF", textAlign: "center" },
});
