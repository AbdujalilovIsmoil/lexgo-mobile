import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STYLE: { icon: IconName; colors: [string, string] }[] = [
  { icon: "zap", colors: ["#1668F0", "#00CFE8"] },
  { icon: "users", colors: ["#6A4DFF", "#A98BFF"] },
  { icon: "shopping-bag", colors: ["#00A870", "#3DDC97"] },
];

type Benefit = { title: string; text: string };

// Swipeable benefit cards with page dots (what you get after signing in).
export function Benefits() {
  const c = useColors();
  const { tList } = useT();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const w = width - 48;
  return (
    <View style={s.wrap}>
      <ScrollView horizontal pagingEnabled={false} snapToInterval={w + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (w + 12)))} scrollEventThrottle={32}>
        {tList<Benefit>("guest.benefits").map((b, i) => (
          <View key={i} style={[s.card, { width: w, backgroundColor: c.surface, borderColor: c.line }]}>
            <LinearGradient colors={STYLE[i % 3].colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}><Icon name={STYLE[i % 3].icon} size={22} tone="white" /></LinearGradient>
            <View style={s.copy}><Text variant="h4">{b.title}</Text><Text variant="small" tone="gray">{b.text}</Text></View>
          </View>
        ))}
      </ScrollView>
      <View style={s.dots}>{[0, 1, 2].map((i) => <View key={i} style={[s.dot, { backgroundColor: i === page ? c.accent : c.line, width: i === page ? 18 : 6 }]} />)}</View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12 },
  row: { gap: 12, paddingHorizontal: 24 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 22, borderWidth: 1 },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 3 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});
