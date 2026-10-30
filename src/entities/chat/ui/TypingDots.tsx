import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useAiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";

function Dot({ delay }: { delay: number }) {
  const aiTheme = useAiTheme();
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-5, { duration: 280 }), withTiming(0, { duration: 280 })), -1, false));
  }, [delay, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[s.dot, { backgroundColor: aiTheme.accent }, a]} />;
}

// Assistant "typing" indicator in a glass bubble, optionally with a status line.
export function TypingDots({ label }: { label?: string }) {
  const aiTheme = useAiTheme();
  return (
    <View style={[s.bubble, { borderColor: aiTheme.border, backgroundColor: aiTheme.card }]}>
      <View style={s.dots}>
        {[0, 150, 300].map((d) => (
          <Dot key={d} delay={d} />
        ))}
      </View>
      {label ? <Text variant="caption" style={{ color: aiTheme.muted }}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  bubble: { gap: 8, alignSelf: "flex-start", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 22, borderBottomLeftRadius: 7, borderWidth: 1, marginVertical: 5 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
