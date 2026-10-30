import { Fragment, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { AdminPage } from "@/shared/ui/admin";
import { Button, Icon, PressableScale, Text, singleLineText, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { AskAiSheet, useSupportAi } from "@/features/support";

const GROUPS: { key: string; icon: IconName }[] = [
  { key: "subscription", icon: "star" },
  { key: "payment", icon: "credit-card" },
  { key: "documents", icon: "file-text" },
  { key: "marketplace", icon: "users" },
  { key: "urgent", icon: "zap" },
  { key: "account", icon: "user" },
];

// /support/faq — the help centre's frequent questions on their own page: a search, the questions by topic as rows of one card each; a tap
// asks the AI instructor (its answer opens in the AI sheet). Nothing matched → ask the typed text yourself; at the end, the operator chat.
export function SupportFaqPage() {
  const { t, tList } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const ai = useSupportAi();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const needle = q.trim().toLowerCase();
  const groups = GROUPS.map((g) => ({ ...g, items: tList(`sp1.faq.groups.${g.key}`).filter((x) => !needle || x.toLowerCase().includes(needle)) })).filter((g) => g.items.length);
  const ask = (text: string) => { ai.ask(text); setOpen(true); };
  const operator = () => { setOpen(false); router.dismissTo({ pathname: "/support", params: { new: "1" } } as never); };
  return (
    <AdminPage title={t("sp1.hub2.faqTitle")}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text variant="body" tone="gray">{t("sp1.faq.lead")}</Text>
        <View style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="search" size={19} tone="gray" />
          <TextInput value={q} onChangeText={setQ} placeholder={t("sp1.faq.searchPh")} placeholderTextColor={c.gray2} returnKeyType="search" accessibilityLabel={t("sp1.faq.searchPh")} style={[s.input, { color: c.ink }, singleLineText]} />
          {q ? <PressableScale onPress={() => setQ("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("sp1.clearSearch")}><Icon name="x" size={17} tone="gray" /></PressableScale> : null}
        </View>
        {groups.map((g) => (
          <View key={g.key} style={s.group}>
            <View style={s.head}>
              <Icon name={g.icon} size={14} tone="gray" />
              <Text variant="caption" weight="bold" tone="gray" style={s.headTx}>{t(`sp1.topics.${g.key}.label`).toUpperCase()}</Text>
            </View>
            <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
              {g.items.map((x, i) => (
                <Fragment key={x}>
                  <PressableScale onPress={() => ask(x)} scale={0.99} accessibilityRole="button" style={s.row}>
                    <Text variant="body" weight="semibold" style={s.flex}>{x}</Text>
                    <Icon name="chevron-right" size={18} tone="gray" />
                  </PressableScale>
                  {i < g.items.length - 1 ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
                </Fragment>
              ))}
            </View>
          </View>
        ))}
        {!groups.length ? (
          <View style={[s.card, s.box, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Text variant="h4">{t("sp1.faq.noMatch")}</Text>
            <Text variant="small" tone="gray">{t("sp1.faq.noMatchText")}</Text>
            <Button title={t("sp1.faq.askOwn")} icon="zap" variant="soft" onPress={() => ask(q.trim())} />
          </View>
        ) : null}
        <View style={[s.card, s.box, { backgroundColor: c.surface2, borderColor: c.line }]}>
          <View style={s.moreRow}>
            <View style={[s.ico, { backgroundColor: c.surface }]}><Icon name="headphones" size={19} color={c.accent} /></View>
            <View style={s.flex}>
              <Text variant="h4">{t("sp1.faq.moreTitle")}</Text>
              <Text variant="small" tone="gray">{t("sp1.faq.moreText")}</Text>
            </View>
          </View>
          <Button title={t("sp1.hub2.newChat")} icon="message-circle" variant="gradient" onPress={operator} />
        </View>
      </ScrollView>
      <AskAiSheet visible={open} onClose={() => setOpen(false)} onHandoff={operator} />
    </AdminPage>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 14 },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderRadius: 18, borderWidth: 1, paddingLeft: 16, paddingRight: 12 },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 12 },
  group: { gap: 8, marginTop: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 4 },
  headTx: { letterSpacing: 0.8 },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  box: { padding: 16, gap: 12, marginTop: 4 },
  moreRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ico: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
