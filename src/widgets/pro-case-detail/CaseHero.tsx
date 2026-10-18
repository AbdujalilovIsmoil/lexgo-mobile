import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { caseTint, dueOf, isClosedCase, type ProCase } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { fmtDate, initials } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { gradient, radius } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { daysLeft } from "./daysLeft";
import { STEPS, stepIndex } from "./caseSteps";

// The top of a case: the client as the headline with a status-coloured monogram, number and type, a progress bar along the case's
// path (new → … → completed), the deadline as a countdown chip, and the next step in its own box.
export function CaseHero({ item, client }: { item: ProCase; client?: string }) {
  const { t, locale } = useT();
  const tint = caseTint(item.status);
  const head = client || item.title || item.number;
  const at = stepIndex(item.status);
  const closed = isClosedCase(item.status);
  const due = dueOf(item.deadlineAt, closed);
  const n = daysLeft(item.deadlineAt);
  const dueTone = due === "overdue" ? "#FF8A8A" : due === "today" ? "#FFC96B" : "#9EE7FF";
  const dueText = !item.deadlineAt ? t("csd.noDeadline") : due === "overdue" ? t("csd.late", { n: -n }) : n === 0 ? t("csd.today") : t("csd.left", { n });
  return (
    <LinearGradient colors={[...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={[s.glow, { backgroundColor: `${tint}38` }]} pointerEvents="none" />
      <View style={s.top}>
        <View style={[s.mono, { backgroundColor: `${tint}33`, borderColor: `${tint}88` }]}><Text variant="h4" weight="bold" tone="white">{initials(head) || "?"}</Text></View>
        <View style={s.who}>
          <Text variant="h3" tone="white" numberOfLines={2}>{head}</Text>
          <Text variant="small" style={s.soft} numberOfLines={1}>{[client ? item.title : "", item.number].filter(Boolean).join(" · ")}</Text>
        </View>
      </View>
      <View style={s.pills}>
        <View style={[s.pill, { backgroundColor: `${tint}44` }]}><View style={[s.dot, { backgroundColor: tint }]} /><Text variant="caption" weight="bold" tone="white">{tOr(t, `aw11.caseStatus.${item.status}`, item.status)}</Text></View>
        {item.type ? <View style={s.pill}><Icon name="tag" size={12} tone="white" /><Text variant="caption" weight="bold" tone="white">{item.type}</Text></View> : null}
        <View style={s.pill}><Icon name="clock" size={12} color={dueTone} /><Text variant="caption" weight="bold" style={{ color: dueTone }}>{dueText}{item.deadlineAt ? ` · ${fmtDate(item.deadlineAt, locale)}` : ""}</Text></View>
      </View>
      <View style={s.steps}>
        <View style={s.bars}>{STEPS.map((k, i) => <View key={k} style={[s.bar, { backgroundColor: i <= at ? tint : "rgba(255,255,255,0.18)" }]} />)}</View>
        <View style={s.stepTx}><Text variant="caption" style={s.soft}>{t("csd.step")}: <Text variant="caption" weight="bold" tone="white">{item.stage ? tOr(t, `aw11.stage.${item.stage}`, item.stage) : tOr(t, `aw11.caseStatus.${item.status}`, item.status)}</Text></Text><Text variant="caption" style={s.soft}>{at + 1}/{STEPS.length}</Text></View>
      </View>
      {item.nextAction ? (
        <View style={s.next}>
          <Icon name="arrow-right-circle" size={18} color="#00CFE8" />
          <View style={s.nextTx}><Text variant="caption" style={s.soft}>{t("csd.next")}</Text><Text variant="body" weight="semibold" tone="white">{item.nextAction}</Text></View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 18, borderRadius: radius.rl, overflow: "hidden" },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, right: -70, top: -90 },
  top: { flexDirection: "row", alignItems: "center", gap: 14 },
  mono: { width: 54, height: 54, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  who: { flex: 1, gap: 2 },
  soft: { color: "rgba(255,255,255,0.72)" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  steps: { gap: 8 },
  bars: { flexDirection: "row", gap: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  stepTx: { flexDirection: "row", justifyContent: "space-between" },
  next: { flexDirection: "row", gap: 12, alignItems: "center", padding: 13, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)" },
  nextTx: { flex: 1, gap: 1 },
});
