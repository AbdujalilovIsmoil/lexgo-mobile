import type { ReactNode } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMarketMeta } from "@/entities/lawyer";
import { Icon, PressableScale, singleLineText, Text } from "@/shared/ui";
import { brand, gradient, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { HeroStats, type Stats } from "./HeroStats";

type Props = { value: string; onChange: (v: string) => void; onFind: () => void; onClear: () => void; onExample: (x: string) => void; stats: Stats; children?: ReactNode };

// The web directory's hero as ONE card: the "Marketplace" kicker, the headline with its gradient words, the lead, the white
// search pill (AI tile, "->": runs the AI search; a name typed here still filters the list), the popular services, the
// three counters and — inside the same card — the featured specialists (`children`, the carousel).
export function MarketHero({ value, onChange, onFind, onClear, onExample, stats, children }: Props) {
  const { t } = useT();
  const services = useMarketMeta().data?.services ?? [];
  const seen = new Set<string>();
  const examples = services.filter((x) => x.title.trim() && x.title.length <= 30 && !seen.has(x.categoryId) && !!seen.add(x.categoryId)).slice(0, 3).map((x) => x.title.trim());
  return (
    <Animated.View entering={FadeInDown.duration(320)} style={s.wrap}>
      <LinearGradient colors={["#0B1F45", "#123A86", "#0E5FC4"]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={s.hero}>
        <View style={s.glow} pointerEvents="none" />
        <View style={s.kicker}><Icon name="shield" size={14} color={brand.cy} /><Text variant="caption" weight="bold" style={s.kickT}>{t("mk1.heroKicker")}</Text></View>
        <Text variant="h2" tone="white">{t("mk1.heroA")}<Text variant="h2" style={s.hl}>{t("mk1.heroHl")}</Text>{t("mk1.heroB")}</Text>
        <Text variant="small" style={s.lead}>{t("mk1.heroLead")}</Text>
        <View style={s.field}>
          <LinearGradient colors={["#7A5CFF", brand.b600, brand.cy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ai}><Icon name="star" size={18} color="#FFFFFF" /></LinearGradient>
          <TextInput value={value} onChangeText={onChange} onSubmitEditing={onFind} returnKeyType="search" placeholder={t("mk1.heroPh")} placeholderTextColor="#7D8CA3" accessibilityLabel={t("mk1.aiChip")} style={[s.input, singleLineText]} />
          {value ? <PressableScale onPress={onClear} hitSlop={10} accessibilityLabel={t("flt.clear")}><Icon name="x-circle" size={18} color="#7D8CA3" /></PressableScale> : null}
          <PressableScale onPress={onFind} accessibilityRole="button" accessibilityLabel={t("mk1.find")}>
            <LinearGradient colors={[...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.go}><Icon name="arrow-right" size={20} color="#FFFFFF" /></LinearGradient>
          </PressableScale>
        </View>
        {examples.length ? (
          <View style={s.exRow}>
            <Text variant="small" weight="semibold" style={s.exLabel}>{t("mk1.heroExamples")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.exChips} keyboardShouldPersistTaps="handled">
              {examples.map((x) => <PressableScale key={x} onPress={() => onExample(x)} style={s.chip}><Icon name="briefcase" size={14} color="#CFE2FF" /><Text variant="small" weight="semibold" tone="white" numberOfLines={1}>{x}</Text></PressableScale>)}
            </ScrollView>
          </View>
        ) : null}
        <HeroStats stats={stats} />
        {children ? <View style={s.show}>{children}</View> : null}
      </LinearGradient>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  hero: { padding: 22, gap: 14, borderRadius: radius.rx, overflow: "hidden" },
  glow: { position: "absolute", top: -90, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(0,207,232,0.18)" },
  kicker: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  kickT: { color: "#E8F1FF", letterSpacing: 2, textTransform: "uppercase" },
  hl: { color: brand.cy },
  lead: { color: "#B7CDEC", lineHeight: 21 },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58, paddingLeft: 8, paddingRight: 6, borderRadius: 29, backgroundColor: "rgba(255,255,255,0.96)", borderWidth: 2, borderColor: "#5C8DFF" },
  ai: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, minWidth: 0, color: "#0A1526", fontSize: 15, paddingVertical: 10 },
  go: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  exRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  exLabel: { color: "#B7CDEC" },
  exChips: { gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", maxWidth: 220 },
  show: { marginHorizontal: -22, marginTop: 4 },
});
