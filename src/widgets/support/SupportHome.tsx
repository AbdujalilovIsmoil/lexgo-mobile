import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { openTel } from "@/shared/lib/links";
import { SUPPORT_PHONE } from "@/shared/config/env";
import { useT } from "@/shared/i18n";
import { scheduleText, useSupportHours } from "@/entities/support";
import { AskAiSheet, useSupportAi } from "@/features/support";

const TOPICS = ["subscription", "payment", "documents", "marketplace", "urgent", "account"] as const;

type Props = { onStart: (force: boolean) => void };

// Top of the help centre, as in the design: the navy card (AI is there day and night → "write to the AI instructor"; the operators'
// hours from the backend under it), then four ways in two by two — a new request (operator chat), a call, a complaint, the frequent
// questions (each one asked to the AI) — and the "my requests" list follows (the page's own list).
export function SupportHome({ onStart }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const ai = useSupportAi();
  const hours = useSupportHours();
  const [open, setOpen] = useState(false);
  const [faq, setFaq] = useState(false);
  const sched = hours ? scheduleText(hours, (d) => t(`sp4.days.${d}`)) : "";
  const ask = (q: string) => { ai.ask(q); setFaq(false); setOpen(true); };
  const tiles: { key: string; icon: IconName; title: string; sub: string; onPress: () => void }[] = [
    { key: "chat", icon: "message-circle", title: t("sp1.hub2.newChat"), sub: t("sp1.hub2.newChatSub"), onPress: () => onStart(false) },
    { key: "call", icon: "phone", title: t("sp1.hub2.call"), sub: SUPPORT_PHONE, onPress: () => openTel(SUPPORT_PHONE) },
    { key: "complaint", icon: "flag", title: t("sp1.hub2.complaint"), sub: t("sp1.hub2.complaintSub"), onPress: () => router.push("/complaints") },
    { key: "faq", icon: "book-open", title: t("sp1.hub2.faq"), sub: t("sp1.hub2.faqSub"), onPress: () => setFaq(true) },
  ];
  return (
    <View style={s.col}>
      <LinearGradient colors={["#14295F", "#1D3D8F", "#2856B4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.kickRow}><View style={s.dot} /><Text variant="caption" weight="bold" style={s.kicker}>{t("sp1.hub2.kicker").toUpperCase()}</Text></View>
        <Text variant="h2" tone="white">{t("sp1.hub2.title")}</Text>
        <Text variant="body" style={s.dim}>{t("sp1.hub2.lead")}</Text>
        <PressableScale onPress={() => setOpen(true)} scale={0.97} accessibilityRole="button" style={s.cta}>
          <Icon name="zap" size={18} color="#0B1636" />
          <Text variant="body" weight="bold" style={{ color: "#0B1636" }}>{t("sp1.hub2.ai")}</Text>
        </PressableScale>
        {ai.turns.length ? (
          <PressableScale onPress={() => setOpen(true)} hitSlop={6} style={s.resume}>
            <Icon name="message-circle" size={14} tone="white" />
            <Text variant="small" weight="semibold" tone="white">{t("sp1.hub2.aiResume", { n: ai.turns.length })}</Text>
          </PressableScale>
        ) : null}
        {sched ? (
          <View style={s.hours}>
            <View style={[s.hDot, { backgroundColor: hours?.open ? "#4ADE80" : "#F4B63F" }]} />
            <Text variant="caption" style={s.dim}>{t(hours?.open ? "sp1.hub2.hoursOpen" : "sp1.hub2.hoursClosed", { s: sched })}</Text>
          </View>
        ) : null}
      </LinearGradient>
      <View style={s.grid}>
        {tiles.map((x) => (
          <PressableScale key={x.key} onPress={x.onPress} scale={0.97} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[s.ico, { backgroundColor: c.surface2 }]}><Icon name={x.icon} size={20} color={c.accent} /></View>
            <Text variant="h4" numberOfLines={1}>{x.title}</Text>
            <Text variant="small" tone="gray" numberOfLines={1}>{x.sub}</Text>
          </PressableScale>
        ))}
      </View>
      <Text variant="caption" weight="bold" tone="gray" style={s.head}>{t("sp1.hub2.mine").toUpperCase()}</Text>
      <AskAiSheet visible={open} onClose={() => setOpen(false)} onHandoff={() => { setOpen(false); onStart(false); }} />
      <ActionList visible={faq} onClose={() => setFaq(false)} title={t("sp1.hub2.faqTitle")} actions={TOPICS.map((k) => ({ key: k, label: t(`sp1.topics.${k}.q`), icon: "help-circle" as const, onPress: () => ask(t(`sp1.topics.${k}.q`)) }))} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12, paddingTop: 4 },
  hero: { borderRadius: 24, padding: 20, gap: 10 },
  kickRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  kicker: { color: "rgba(255,255,255,0.8)", letterSpacing: 0.8 },
  dim: { color: "rgba(255,255,255,0.8)" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 16, minHeight: 52, marginTop: 6 },
  resume: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center" },
  hours: { flexDirection: "row", alignItems: "center", gap: 7 },
  hDot: { width: 7, height: 7, borderRadius: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, gap: 6, padding: 16, borderRadius: 20, borderWidth: 1, minHeight: 128 },
  ico: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  head: { letterSpacing: 0.8, marginLeft: 4, marginTop: 12 },
});
