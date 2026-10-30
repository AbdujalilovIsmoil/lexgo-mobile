import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { MODE_ICON, StatusBadge, flowOf, stepProgress, toneOf, useToneColor, type DocRow } from "@/entities/my-document";
import { DocCardActions } from "@/features/my-documents";

type Props = { row: DocRow; first?: boolean; last?: boolean; onOpen: (id: string) => void; onSend: (id: string) => void };

// One document as a row of its section's card: mode icon tile, title (2 lines), status pill, one meta line (date · step) and at most one
// quick action. Everything else is in the detail sheet the row opens. `first` / `last` round the card's corners and close its edges.
export function DocListItem({ row, first = true, last = true, onOpen, onSend }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const color = useToneColor();
  const tone = color(toneOf(row.status));
  const prog = stepProgress(flowOf(row));
  const meta = [fmtDate(row.createdAt, locale), prog ? t("docSheet.step", { at: prog.at, total: prog.total }) : ""].filter(Boolean).join(" · ");
  const key = `dm2.status.${row.status.toLowerCase()}`;
  const status = t(key) !== key ? t(key) : row.statusLabel || humanizeSlug(row.status);
  const title = row.title || t("dm1.untitled");
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, first && s.first, last && s.last, !last && { borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <PressableScale onPress={() => onOpen(row.id)} accessibilityRole="button" accessibilityLabel={t("docSheet.openCard", { title, status })} style={s.body}>
        <View style={[s.tile, { backgroundColor: `${tone}22` }]}><Icon name={MODE_ICON[row.mode]} size={20} color={tone} /></View>
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={2}>{title}</Text>
          <View style={s.meta}>
            <StatusBadge status={row.status} label={row.statusLabel} />
            {meta ? <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{meta}</Text> : null}
          </View>
        </View>
        <Icon name="chevron-right" size={18} color={c.gray2} />
      </PressableScale>
      <DocCardActions row={row} onSend={onSend} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  body: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
