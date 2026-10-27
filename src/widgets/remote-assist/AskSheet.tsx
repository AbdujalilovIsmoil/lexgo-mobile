import { useEffect } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { answerAsk, askShown, useRaAsk, useRaStore, type RaAsk } from "@/features/remote-assist";
import { Icon, Text } from "@/shared/ui";
import { SheetActions } from "@/shared/ui/profile";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { actionName, pageName } from "./names";

function Body({ ask }: { ask: RaAsk }) {
  const { t } = useT();
  const c = useColors();
  if (ask.kind === "draft") {
    return (
      <>
        <Text variant="small" tone="gray">{t("ra.askDraft")}</Text>
        <View style={[s.rows, { borderColor: c.line }]}>
          {ask.rows.map((r, i) => (
            <View key={`${r.label}-${i}`} style={s.pair}>
              <Text variant="caption" tone="gray">{r.label}</Text>
              <Text variant="body" weight="semibold" selectable>{r.value || "—"}</Text>
            </View>
          ))}
        </View>
      </>
    );
  }
  if (ask.kind === "present") {
    return (
      <>
        <Text variant="small">{t("ra.askPresent", { label: ask.label })}</Text>
        {ask.summary ? <Text variant="small" tone="gray">{ask.summary}</Text> : null}
        <View style={[s.note, { backgroundColor: c.tint }]}>
          <Icon name="info" size={16} color={c.accent} />
          <Text variant="caption" tone="gray" style={s.fill}>{t("ra.askPresentNote")}</Text>
        </View>
      </>
    );
  }
  const text = ask.actionId === "route.navigate" ? t("ra.askOpen", { label: pageName(t, ask.label) }) : t("ra.askAction", { action: actionName(t, ask.actionId), label: ask.label });
  return <Text variant="small">{text}</Text>;
}

/**
 * The client's own confirmation of a prepared draft, a final step or an action the contract marks for confirmation (TZ RA §11, §17).
 * Nothing is applied before "Roziman"; "Ko'rsatish" only shows a final button — pressing it stays the client's. Showing the sheet sends
 * confirmation_required once.
 */
export function AskSheet() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const ask = useRaAsk((s) => s.ask);
  const name = useRaStore((s) => s.session?.operator.name) || t("ra.operator");
  useEffect(() => {
    if (ask) askShown(ask.seq);
  }, [ask]);
  if (!ask) return null;
  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={() => answerAsk(false)}>
      <View style={s.root}>
        <View style={[StyleSheet.absoluteFill, s.dim]} />
        <View style={[s.card, shadows.s2, { backgroundColor: c.surface, paddingBottom: insets.bottom + 14 }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            <View style={s.head}>
              <View style={[s.badge, { backgroundColor: c.tint2 }]}><Icon name="headphones" size={20} color={c.accent} /></View>
              <Text variant="h4" style={s.fill}>{t("ra.askBy", { name })}</Text>
            </View>
            <Body ask={ask} />
          </ScrollView>
          <View style={s.actions}>
            <SheetActions cancel={{ label: t("ra.no"), onPress: () => answerAsk(false) }} submit={{ label: ask.kind === "present" ? t("ra.show") : t("ra.yes"), onPress: () => answerAsk(true) }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  dim: { backgroundColor: "rgba(2,10,28,0.5)" },
  card: { maxHeight: "80%", borderTopLeftRadius: radius.rx, borderTopRightRadius: radius.rx, paddingTop: 20, width: "100%", maxWidth: 560, alignSelf: "center" },
  body: { paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  fill: { flex: 1 },
  rows: { borderWidth: 1, borderRadius: radius.r, padding: 12, gap: 10 },
  pair: { gap: 2 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: radius.r },
  actions: { paddingHorizontal: 20, paddingTop: 6 },
});
