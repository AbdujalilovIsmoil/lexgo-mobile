import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { AskAiSheet, useSupportAi } from "@/features/support";

const TOPICS = ["subscription", "payment", "documents", "marketplace"] as const;

// Step 1: ask the AI. A violet-to-blue card: tag, title, text, a glass question field with a round send button,
// and the quick topics as glass pills.
export function AiAskCard({ onOperator }: { onOperator: () => void }) {
  const { t } = useT();
  const ai = useSupportAi();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const ask = (q: string) => { if (!q.trim()) return; ai.ask(q); setText(""); setOpen(true); };
  return (
    <LinearGradient colors={["#5B3FD9", "#1668F0", "#0E8FD6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.top}>
        <View style={s.badge}><Icon name="zap" size={20} tone="white" /></View>
        <View style={s.fill}>
          <View style={s.tag}><View style={s.dot} /><Text variant="caption" style={s.tagTx}>{t("sp1.aiHint")}</Text></View>
          <Text variant="h3" tone="white">{t("sp1.aiTitle")}</Text>
        </View>
      </View>
      <Text variant="small" style={s.txt}>{t("sp1.aiText")}</Text>
      <View style={s.field}>
        <TextInput value={text} onChangeText={setText} accessibilityLabel={t("sp1.askPh")} placeholder={t("sp1.askPh")} placeholderTextColor="rgba(255,255,255,0.6)" returnKeyType="send" onSubmitEditing={() => ask(text)} maxLength={1000} style={s.input} />
        <PressableScale onPress={() => ask(text)} disabled={!text.trim()} style={[s.send, !text.trim() && s.off]} accessibilityLabel={t("sp1.ask")}>
          <Icon name="send" size={18} color="#1668F0" />
        </PressableScale>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} keyboardShouldPersistTaps="handled" style={s.rail}>
        <Text variant="caption" style={s.quick}>{t("sp1.quick")}</Text>
        {TOPICS.map((k) => (
          <PressableScale key={k} onPress={() => ask(t(`sp1.topics.${k}.q`))} style={s.pill}><Text variant="small" weight="semibold" tone="white">{t(`sp1.topics.${k}.label`)}</Text></PressableScale>
        ))}
      </ScrollView>
      {ai.turns.length ? (
        <PressableScale onPress={() => setOpen(true)} style={s.resume}>
          <Icon name="message-circle" size={14} tone="white" />
          <Text variant="small" weight="semibold" tone="white">{t("sp1.aiResume", { n: ai.turns.length })}</Text>
        </PressableScale>
      ) : null}
      <AskAiSheet visible={open} onClose={() => setOpen(false)} onHandoff={() => { setOpen(false); onOperator(); }} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 24, padding: 18, gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1 },
  badge: { width: 44, height: 44, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  tag: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3DDC97" },
  tagTx: { color: "#D6E6FF" },
  txt: { color: "#E3EEFF" },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 999, paddingLeft: 16, paddingRight: 5, paddingVertical: 5 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15, paddingVertical: 9 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  off: { opacity: 0.55 },
  rail: { marginHorizontal: -4 },
  chips: { gap: 8, alignItems: "center", paddingHorizontal: 4 },
  quick: { color: "#D6E6FF", marginRight: 2 },
  pill: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  resume: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
});
