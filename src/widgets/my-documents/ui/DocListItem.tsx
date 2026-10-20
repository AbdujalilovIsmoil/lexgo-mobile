import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { MODE_ICON, StatusBadge, flowOf, stepProgress, toneOf, useToneColor, type DocRow } from "@/entities/my-document";
import { DocCardActions } from "@/features/my-documents";

type Props = { row: DocRow; index?: number; onOpen: (id: string) => void; onSend: (id: string) => void };

// A lean card: mode icon tile, title (2 lines), status pill, one meta line (date · step) and at most one quick action.
// Everything else is in the detail sheet the card opens.
export function DocListItem({ row, index = 0, onOpen, onSend }: Props) {
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
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 5) * 35)} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
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
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  body: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 44, height: 44, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
