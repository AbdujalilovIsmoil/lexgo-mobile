import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { complaintStage, type ComplaintItem } from "@/entities/rating";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { brand, radius, shadows, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const FLOW: { key: "write" | "review" | "decision"; icon: IconName }[] = [
  { key: "write", icon: "send" },
  { key: "review", icon: "headphones" },
  { key: "decision", icon: "check-circle" },
];
const OPEN = new Set(["new", "review", "rework"]);

// A hero over the list: the lead, three counters (all / in progress / resolved) and a white "new complaint" button; then the
// three-step flow as one connected row, the auto-complaint note and the support link.
export function ComplaintsHead({ all, onNew }: { all: ComplaintItem[]; onNew: () => void }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const open = all.filter((x) => OPEN.has(complaintStage(x.status))).length;
  const stats: [string, number][] = [[t("cpl.total"), all.length], [t("cpl.open"), open], [t("cpl.done"), all.length - open]];
  return (
    <View style={s.col}>
      <LinearGradient colors={[brand.b800, brand.b600, "#0E9FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadows.blue]}>
        <Text variant="h3" tone="white">{t("cpl.hero")}</Text>
        <Text variant="small" tone="white" style={s.soft}>{t("pwc.lead")}</Text>
        <View style={s.stats}>
          {stats.map(([label, n], i) => <View key={i} style={s.stat}><Text variant="h3" tone="white">{n}</Text><Text variant="caption" tone="white" numberOfLines={1} style={s.soft}>{label}</Text></View>)}
        </View>
        <PressableScale onPress={onNew} accessibilityRole="button" style={s.cta}>
          <Icon name="plus" size={18} color={brand.b900} /><Text variant="body" weight="bold" style={{ color: brand.b900 }}>{t("pwc.new")}</Text>
        </PressableScale>
      </LinearGradient>
      <View style={s.flow}>
        {FLOW.map((f, i) => (
          <View key={f.key} style={s.step}>
            <View style={s.rail}>
              <View style={[s.line, { backgroundColor: i ? c.tint2 : "transparent" }]} />
              <View style={[s.dot, { backgroundColor: c.tint2 }]}><Icon name={f.icon} size={18} tone="accent" /></View>
              <View style={[s.line, { backgroundColor: i < FLOW.length - 1 ? c.tint2 : "transparent" }]} />
            </View>
            <Text variant="caption" weight="bold" center numberOfLines={2}>{t(`pwc.steps.${f.key}`)}</Text>
          </View>
        ))}
      </View>
      <View style={s.note}><Icon name="star" size={16} tone="accent" /><Text variant="caption" tone="gray" style={s.flex}>{t("py5.auto")}</Text></View>
      <PressableScale onPress={() => router.push("/support")} style={s.note}>
        <Icon name="message-circle" size={16} tone="accent" />
        <Text variant="small" tone="accent" weight="semibold" style={s.flex}>{t("pwc.chatLink")}</Text>
        <Icon name="arrow-right" size={16} tone="accent" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14, paddingBottom: 12 },
  hero: { padding: 18, borderRadius: radius.rl, gap: 8, overflow: "hidden" },
  soft: { opacity: 0.85 },
  stats: { flexDirection: "row", gap: 8, marginVertical: 6 },
  stat: { flex: 1, gap: 1, padding: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF" },
  flow: { flexDirection: "row" },
  step: { flex: 1, alignItems: "center", gap: 3 },
  rail: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginBottom: 4 },
  line: { flex: 1, height: 3 },
  dot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  note: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
