import { StyleSheet, View } from "react-native";
import { caseTint, useCaseTimeline } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { useColors } from "@/shared/theme";
import { Skeleton, Text } from "@/shared/ui";
import { EmptyTile } from "./CaseSection";

// Case timeline as a vertical line of dots (newest first): what changed, the stage / status / next step it changed to, and when.
export function CaseHistory({ caseId }: { caseId: string }) {
  const { t, locale } = useT();
  const c = useColors();
  const q = useCaseTimeline(caseId);
  if (q.isLoading) return <Skeleton height={90} round={20} />;
  const rows = q.data ?? [];
  if (!rows.length) return <EmptyTile icon="clock" text={t("aw5.noHistory")} />;
  return (
    <View>
      {rows.map((x, i) => {
        const tint = caseTint(x.status);
        const sub = [x.stage ? tOr(t, `aw11.stage.${x.stage}`, x.stage) : "", x.status ? tOr(t, `aw11.caseStatus.${x.status}`, x.status) : ""].filter((v, i, a) => v && a.indexOf(v) === i).join(" · ");
        return (
          <View key={x.id} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, { backgroundColor: tint, borderColor: `${tint}55` }]} />
              {i < rows.length - 1 ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
            </View>
            <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <Text variant="small" weight="bold">{tOr(t, `aw5.kind.${x.kind}`, x.kind)}</Text>
              {sub ? <Text variant="caption" tone="accent" weight="semibold">{sub}</Text> : null}
              {x.nextAction ? <Text variant="small" tone="gray">{x.nextAction}</Text> : null}
              <Text variant="caption" tone="gray2">{fmtDateTime(x.createdAt, locale)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, marginTop: 14 },
  line: { flex: 1, width: 2, marginTop: 2 },
  card: { flex: 1, gap: 3, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
});
