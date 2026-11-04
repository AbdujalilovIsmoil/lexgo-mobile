import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ServiceList } from "@/widgets/urgent/ServiceList";
import { TabScrollView, useTabPad } from "@/widgets/tab-page";

type Row = { key: string; icon: IconName; tint: string; title: string; sub: string; onPress: () => void };

// "Xizmat turlari": every kind of help the app sells, in one place. First the advocate-on-duty services (video, chat, road accident,
// second opinion — straight from the catalog, with their prices), then the rest: the ready-document catalogue, a specialist's own
// services and the AI helper. Ordering needs an account; the lists themselves are public.
export function ServiceTypes({ onDocs }: { onDocs: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const pad = useTabPad();
  const { colors: c, dark } = useTheme();
  const rows: Row[] = [
    { key: "docs", icon: "file-text", tint: "#5C6E85", title: t("tabs.svt.docsTitle"), sub: t("tabs.svt.docsSub"), onPress: onDocs },
    { key: "lawyers", icon: "briefcase", tint: "#1668F0", title: t("tabs.svt.lawyersTitle"), sub: t("tabs.svt.lawyersSub"), onPress: () => router.push("/lawyers" as never) },
    { key: "ai", icon: "zap", tint: "#7C4DFF", title: t("tabs.svt.aiTitle"), sub: t("tabs.svt.aiSub"), onPress: () => router.push("/(tabs)/ai" as never) },
  ];
  const line = dark ? c.line : "#E9EDF4";
  return (
    <TabScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, gap: 18, paddingBottom: pad }}>
      <ServiceList />
      <View style={s.wrap}>
        <Text variant="caption" weight="bold" tone="gray" style={s.label}>{t("tabs.svt.more").toUpperCase()}</Text>
        <View style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]}>
          {rows.map((r, i) => (
            <PressableScale key={r.key} onPress={r.onPress} scale={0.99} accessibilityRole="button" style={[s.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: line }]}>
              <View style={[s.ico, { backgroundColor: `${r.tint}1A` }]}><Icon name={r.icon} size={20} color={r.tint} /></View>
              <View style={s.flex}>
                <Text variant="h4" numberOfLines={2}>{r.title}</Text>
                <Text variant="small" tone="gray" numberOfLines={2} style={s.sub}>{r.sub}</Text>
              </View>
              <Icon name="chevron-right" size={18} tone="gray" />
            </PressableScale>
          ))}
        </View>
      </View>
    </TabScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  label: { letterSpacing: 0.6, marginLeft: 2 },
  card: { borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  sub: { marginTop: 3 },
});
