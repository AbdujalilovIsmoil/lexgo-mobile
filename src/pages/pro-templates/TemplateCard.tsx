import { ActivityIndicator, StyleSheet, View } from "react-native";
import { categoryKey, type DocTemplate } from "@/entities/doc-template";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { item: DocTemplate; busy: boolean; onOpen: () => void; onDownload: () => void };

// One template as a PDF card: a red "PDF" tile, the title, the branch and how many fields it asks, and a round download button.
// The whole card opens the details sheet; the button downloads at once.
export function TemplateCard({ item, busy, onOpen, onDownload }: Props) {
  const { t } = useT();
  const c = useColors();
  const key = categoryKey(item.category);
  const meta = [key ? t(key) : "", item.fields ? t("tpl.fieldsN", { n: item.fields }) : ""].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${item.name}. ${meta}`} style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, shadows.s1]}>
      <View style={[s.tile, { backgroundColor: c.errBg }]}>
        <Icon name="file-text" size={22} color={c.err} />
        <Text variant="caption" weight="bold" style={{ color: c.err }}>PDF</Text>
      </View>
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={3}>{item.name}</Text>
        {meta ? <Text variant="caption" tone="gray" numberOfLines={1}>{meta}</Text> : null}
      </View>
      <PressableScale onPress={onDownload} disabled={busy} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${t("tpl.download")}: ${item.name}`} style={[s.dl, { backgroundColor: c.tint2 }]}>
        {busy ? <ActivityIndicator size="small" color={c.accentStrong} /> : <Icon name="download" size={20} color={c.accentStrong} />}
      </PressableScale>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.rl, borderWidth: 1, minHeight: 84 },
  tile: { width: 52, height: 60, borderRadius: radius.r, alignItems: "center", justifyContent: "center", gap: 2 },
  col: { flex: 1, gap: 3 },
  dl: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
