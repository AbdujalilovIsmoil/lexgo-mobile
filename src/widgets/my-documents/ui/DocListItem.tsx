import { Platform, StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { StatusBadge, flowOf, stepProgress, type DocRow } from "@/entities/my-document";
import { DocCardActions } from "@/features/my-documents";

type Props = { row: DocRow; first?: boolean; last?: boolean; onOpen: (id: string) => void; onSend: (id: string) => void };

// One document as its own white card (Adliya): the status pill and the document's number on top, the title, one grey line (mode · date ·
// step), then at most one quick action. Everything else is on the page the card opens. (`first` / `last` are kept for the list's calls; every
// card is whole now.)
export function DocListItem({ row, onOpen, onSend }: Props) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  const prog = stepProgress(flowOf(row));
  const modeKey = `dm1.mode.${row.mode}`;
  const mode = t(modeKey) !== modeKey ? t(modeKey) : "";
  const meta = [mode, fmtDate(row.createdAt, locale), prog ? t("docSheet.step", { at: prog.at, total: prog.total }) : ""].filter(Boolean).join(" · ");
  const key = `dm2.status.${row.status.toLowerCase()}`;
  const status = t(key) !== key ? t(key) : row.statusLabel || humanizeSlug(row.status);
  const title = row.title || t("dm1.untitled");
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <PressableScale onPress={() => onOpen(row.id)} scale={0.99} accessibilityRole="button" accessibilityLabel={t("docSheet.openCard", { title, status })} style={s.body}>
        <View style={s.top}>
          <View style={s.pill}><StatusBadge status={row.status} label={row.statusLabel} /></View>
          {row.workId ? <Text variant="small" tone="gray" numberOfLines={1} style={s.num}>{row.workId}</Text> : null}
        </View>
        <Text variant="h4" weight="bold" numberOfLines={2} style={s.title}>{title}</Text>
        {meta ? <Text variant="small" tone="gray" numberOfLines={1} style={s.meta}>{meta}</Text> : null}
      </PressableScale>
      <DocCardActions row={row} onSend={onSend} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  body: { gap: 6 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 2 },
  pill: { flexShrink: 1, alignItems: "flex-start" },
  num: { fontSize: 13.5 },
  title: { fontSize: 16, lineHeight: 22 },
  meta: { fontSize: 13.5, lineHeight: 18 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
