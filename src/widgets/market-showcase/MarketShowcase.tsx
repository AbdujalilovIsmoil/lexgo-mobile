import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { SHOW_W, ShowCard } from "./ShowCard";

const MAX = 10;
const GAP = 12;
const rank = (a: Lawyer, b: Lawyer) => Number(b.rated) - Number(a.rated) || b.rating - a.rating || b.reviews - a.reviews || b.experienceYears - a.experienceYears;

// "Tavsiya etilgan mutaxassislar" inside the hero card: up to ten of the loaded specialists, best-rated first, as a snapping carousel with page dots.
export function MarketShowcase({ items, onOpen }: { items: Lawyer[]; onOpen: (id: string) => void }) {
  const { t } = useT();
    const geo = useGeoLabels();
  const [at, setAt] = useState(0);
  const list = [...items].sort(rank).slice(0, MAX);
  if (!list.length) return null;
  return (
    <View style={s.box}>
      <Text variant="small" weight="semibold" style={s.title}>{t("mkw.show.label")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={SHOW_W + GAP} snapToAlignment="start" contentContainerStyle={s.row} onMomentumScrollEnd={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / (SHOW_W + GAP)))}>
        {list.map((l) => <ShowCard key={l.userId} l={l} spec={l.specializations[0] ? geo.area(l.specializations[0]) : l.services[0]?.title ?? ""} onPress={() => onOpen(l.userId || l.id)} />)}
      </ScrollView>
      {list.length > 1 ? <View style={s.dots}>{list.map((l, i) => <View key={l.userId} style={[s.dot, { backgroundColor: i === at ? "#FFFFFF" : "rgba(255,255,255,0.3)", width: i === at ? 18 : 6 }]} />)}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 12 },
  title: { paddingHorizontal: 22, color: "#B7CDEC" },
  row: { gap: GAP, paddingHorizontal: 22 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});
