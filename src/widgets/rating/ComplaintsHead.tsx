import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { complaintStage, type ComplaintItem } from "@/entities/rating";
import { BottomSheet, Icon, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const FLOW: { key: "write" | "review" | "decision"; icon: IconName }[] = [
  { key: "write", icon: "send" },
  { key: "review", icon: "headphones" },
  { key: "decision", icon: "check-circle" },
];

// The navy card over the list: "N open", three counters (open · under review · resolved, from the backend's statuses) and the white
// "new complaint" button.
export function ComplaintsHead({ all, onNew }: { all: ComplaintItem[]; onNew: () => void }) {
  const { t } = useT();
  const n = (stages: string[]) => all.filter((x) => stages.includes(complaintStage(x.status))).length;
  const open = n(["new"]);
  const review = n(["review", "rework"]);
  const done = n(["resolved"]);
  const live = open + review;
  const cells: [string, number][] = [[t("pwc.head.sOpen"), open], [t("pwc.head.sReview"), review], [t("pwc.head.sDone"), done]];
  return (
    <LinearGradient colors={["#14295F", "#1D3D8F", "#2856B4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
      <Text variant="caption" weight="bold" style={s.kicker}>{t("pwc.head.kicker").toUpperCase()}</Text>
      <Text variant="h2" tone="white">{live ? t("pwc.head.open", { n: live }) : t("pwc.head.none")}</Text>
      <View style={s.stats}>
        {cells.map(([label, v], i) => (
          <View key={label} style={[s.stat, i > 0 && s.rule]}>
            <Text variant="h3" tone="white">{v}</Text>
            <Text variant="caption" numberOfLines={2} style={s.dim}>{label}</Text>
          </View>
        ))}
      </View>
      <PressableScale onPress={onNew} scale={0.97} accessibilityRole="button" style={s.cta}>
        <Icon name="plus" size={18} color="#0B1636" />
        <Text variant="body" weight="bold" style={{ color: "#0B1636" }}>{t("pwc.new")}</Text>
      </PressableScale>
    </LinearGradient>
  );
}

// The row under the list, "Ko'rib chiqish jarayoni", and its sheet: the three steps, how a low rating opens a complaint by itself, and the
// operator chat for what cannot wait.
export function ComplaintProcess() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} scale={0.98} accessibilityRole="button" style={[s.process, { backgroundColor: c.surface, borderColor: c.line }]}>
        <Icon name="list" size={19} tone="accent" />
        <Text variant="h4" style={s.flex}>{t("pwc.timeline")}</Text>
        <Icon name="chevron-right" size={18} tone="gray" />
      </PressableScale>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("pwc.timeline")} snaps={[0.6, 0.85]}>
        <SheetScroll>
          {FLOW.map((f, i) => (
            <View key={f.key} style={s.step}>
              <View style={[s.dot, { backgroundColor: c.tint2 }]}><Icon name={f.icon} size={18} tone="accent" /></View>
              <Text variant="body" weight="semibold" style={s.flex}>{`${i + 1}. ${t(`pwc.steps.${f.key}`)}`}</Text>
            </View>
          ))}
          <View style={[s.note, { backgroundColor: c.surface2 }]}><Icon name="star" size={16} tone="accent" /><Text variant="small" tone="gray" style={s.flex}>{t("py5.auto")}</Text></View>
          <PressableScale onPress={() => { setOpen(false); router.push("/support"); }} accessibilityRole="button" style={s.chat}>
            <Icon name="message-circle" size={16} tone="accent" />
            <Text variant="small" tone="accent" weight="semibold" style={s.flex}>{t("pwc.chatLink")}</Text>
            <Icon name="arrow-right" size={16} tone="accent" />
          </PressableScale>
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 24, padding: 20, gap: 10, marginBottom: 14 },
  kicker: { color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  dim: { color: "rgba(255,255,255,0.8)" },
  stats: { flexDirection: "row", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden", marginTop: 4 },
  stat: { flex: 1, gap: 2, paddingHorizontal: 12, paddingVertical: 12 },
  rule: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.14)" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, borderRadius: 16, backgroundColor: "#FFFFFF", marginTop: 6 },
  process: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 56, borderRadius: 20, borderWidth: 1, marginTop: 14 },
  flex: { flex: 1 },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14 },
  chat: { flexDirection: "row", alignItems: "center", gap: 8 },
});
