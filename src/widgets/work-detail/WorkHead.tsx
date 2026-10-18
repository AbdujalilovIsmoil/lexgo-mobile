import { StyleSheet, View } from "react-native";
import { KIND_ICON, KIND_TINT, WorkStatusPill, useWorkText, type Work } from "@/entities/work";
import { radius, useColors } from "@/shared/theme";
import { fmtDate } from "@/shared/lib/format";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { CopyId } from "./CopyId";

// Top of the work screen: what it is (kind chip + status), its full title, the id to quote and when it was opened.
export function WorkHead({ work }: { work: Work }) {
  const c = useColors();
  const { t, locale } = useT();
  const text = useWorkText();
  const tint = KIND_TINT[work.kind];
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={{ height: 4, backgroundColor: tint }} />
      <View style={s.body}>
        <View style={s.top}>
          <View style={[s.chip, { backgroundColor: `${tint}22` }]}><Icon name={KIND_ICON[work.kind]} size={14} color={tint} /><Text variant="caption" weight="bold" style={{ color: tint }}>{text.kind(work.kind)}</Text></View>
          <WorkStatusPill status={work.status} label={work.statusLabel} small />
        </View>
        <Text variant="h3">{work.title || text.kind(work.kind)}</Text>
        <View style={s.meta}>
          <CopyId value={work.workId} />
          {work.createdAt ? <Text variant="caption" tone="gray2">{t("ntd.wdOpened", { date: fmtDate(work.createdAt, locale) })}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rx, borderWidth: 1, overflow: "hidden" },
  body: { gap: 12, padding: 16 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
});
