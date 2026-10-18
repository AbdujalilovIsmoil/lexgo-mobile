import { StyleSheet, View } from "react-native";
import { Icon, IconButton, Pill, Text } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { MODE_ICON, StatusBadge, toneOf, useToneColor, type DocRow } from "@/entities/my-document";

// Top of the detail sheet: what the document is (icon tile, title, work id · type) and its status and mode pills.
export function DocSheetHead({ row, onClose }: { row: DocRow; onClose: () => void }) {
  const { t } = useT();
  const color = useToneColor();
  const tone = color(toneOf(row.status));
  return (
    <View style={s.col}>
      <View style={s.top}>
        <View style={[s.tile, { backgroundColor: `${tone}22` }]}><Icon name={MODE_ICON[row.mode]} size={24} color={tone} /></View>
        <View style={s.flex}>
          <Text variant="h4" numberOfLines={3}>{row.title || t("dm1.untitled")}</Text>
          {row.workId ? <Text variant="caption" tone="gray" numberOfLines={1} selectable>{row.workId}</Text> : null}
        </View>
        <IconButton icon="x" size={44} label={t("docSheet.close")} onPress={onClose} />
      </View>
      <View style={s.pills}>
        <StatusBadge status={row.status} label={row.statusLabel} small={false} />
        <Pill label={t(`docSheet.modeShort.${row.mode}`)} tone="gray" icon={MODE_ICON[row.mode]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tile: { width: 48, height: 48, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, gap: 2, paddingTop: 2 },
  pills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
});
