import { StyleSheet, View } from "react-native";
import { categoryKey, type DocTemplate } from "@/entities/doc-template";
import { BottomSheet, Button, Icon, Pill, SheetScroll, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useKept } from "@/shared/lib/useKept";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const LANG: Record<string, string> = { "uz-latn": "O'zbek", "uz-cyrl": "Ўзбек", uz: "O'zbek", ru: "Русский", en: "English" };

type Props = { item: DocTemplate | null; busy: boolean; onClose: () => void; onDownload: (t: DocTemplate) => void };

// The template in a bit more detail (what it is, how many things the client fills in, language, last update) with the download
// button pinned at the bottom.
export function TemplateSheet({ item: current, busy, onClose, onDownload }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const item = useKept(current);
  const key = item ? categoryKey(item.category) : "";
  const facts = item
    ? [
        { icon: "list" as const, label: t("tpl.fields"), value: item.fields ? String(item.fields) : "" },
        { icon: "layers" as const, label: t("tpl.sections"), value: item.sections ? String(item.sections) : "" },
        { icon: "globe" as const, label: t("tpl.language"), value: item.language ? (LANG[item.language] ?? item.language) : "" },
        { icon: "clock" as const, label: t("tpl.updated"), value: item.updatedAt ? fmtDate(item.updatedAt, locale) : "" },
      ].filter((f) => f.value)
    : [];
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={t("tpl.sheetTitle")} snaps={[0.62, 0.9]}>
      <SheetScroll contentContainerStyle={s.body}>
        {item ? (
          <>
            <View style={s.head}>
              <View style={[s.tile, { backgroundColor: c.errBg }]}>
                <Icon name="file-text" size={26} color={c.err} />
                <Text variant="caption" weight="bold" style={{ color: c.err }}>PDF</Text>
              </View>
              <View style={s.flex}>
                <Text variant="h4">{item.name}</Text>
                {key ? <View style={s.pills}><Pill label={t(key)} tone="blue" small /></View> : null}
              </View>
            </View>
            {item.description && item.description !== item.name ? <Text variant="small" tone="gray">{item.description}</Text> : null}
            {facts.length ? (
              <View style={s.grid}>
                {facts.map((f) => (
                  <View key={f.label} style={[s.fact, { backgroundColor: c.surface2 }]}>
                    <Icon name={f.icon} size={16} tone="gray" />
                    <Text variant="caption" tone="gray">{f.label}</Text>
                    <Text variant="body" weight="bold" numberOfLines={1}>{f.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </SheetScroll>
      {item ? (
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          <Button title={t("tpl.download")} icon="download" variant="gradient" loading={busy} disabled={busy} onPress={() => onDownload(item)} full />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 12, gap: 14 },
  head: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  flex: { flex: 1, gap: 8 },
  tile: { width: 60, height: 72, borderRadius: radius.r, alignItems: "center", justifyContent: "center", gap: 2 },
  pills: { flexDirection: "row" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fact: { width: "48%", gap: 3, padding: 12, borderRadius: radius.r },
  bar: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
});
