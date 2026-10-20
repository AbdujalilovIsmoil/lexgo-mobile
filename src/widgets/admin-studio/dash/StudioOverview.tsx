import { Image, StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Text } from "@/shared/ui";
import { KPI_ART, useRegistry, useSummary } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const RING = 84;
const STROKE = 9;
type Tile = { key: keyof typeof KPI_ART; value: number | null; hint: string };

// "Umumiy holat", as on the web home: a ring with how much of the studio is set up (constructors done / total), the two lines under the
// title; then the records as a pipeline — the total with its active count, one bar showing how the records are spread over the stages, and a
// row per stage (draft, in review, awaiting publication, on the site) with its picture and count. The numbers are the server's summary and the constructor registry, never counted from a page.
export function StudioOverview() {
  const { t } = useT();
  const c = useColors();
  const reg = useRegistry().data;
  const sum = useSummary().data;
  const groups = reg?.groups ?? [];
  const total = groups.reduce((n, g) => n + g.total, 0) || reg?.items.length || 0;
  const done = groups.reduce((n, g) => n + g.completed, 0);
  const full = groups.filter((g) => g.total > 0 && g.completed >= g.total).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const by = sum?.byStatus ?? {};
  const val = (n: number) => (sum ? n : null);
  const tiles: Tile[] = [
    { key: "total", value: val(sum?.total ?? 0), hint: sum ? t("admStudioD.ov.totalActive", { n: sum.activeTotal }) : "" },
    { key: "published", value: val(by.published ?? 0), hint: t("admStudioD.ov.publishedHint") },
    { key: "draft", value: val(by.draft ?? 0), hint: t("admStudioD.ov.draftHint") },
    { key: "submitted", value: val((by.submitted ?? 0) + (by.in_review ?? 0)), hint: t("admStudioD.ov.submittedHint") },
    { key: "approved", value: val(by.approved ?? 0), hint: t("admStudioD.ov.approvedHint") },
  ];
  const stages = (["draft", "submitted", "approved", "published"] as const).map((k) => tiles.find((x) => x.key === k) as Tile).map((x) => ({ ...x, color: { published: c.ok, draft: c.gray, submitted: c.warn, approved: c.accent }[x.key as "published" | "draft" | "submitted" | "approved"] }));
  const rect = Skia.XYWHRect(STROKE / 2, STROKE / 2, RING - STROKE, RING - STROKE);
  const track = Skia.PathBuilder.Make().addArc(rect, 0, 359.9).build();
  const arc = Skia.PathBuilder.Make().addArc(rect, -90, Math.max((pct / 100) * 360, pct ? 5 : 0)).build();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[s.glow, { backgroundColor: `${c.accent}1A` }]} />
      <View style={s.head}>
        <View style={s.ring} accessible accessibilityLabel={t("admStudioD.ov.ringLabel", { pct })}>
          <Canvas style={{ width: RING, height: RING }}>
            <Path path={track} style="stroke" strokeWidth={STROKE} color={c.surface2} />
            {pct ? <Path path={arc} style="stroke" strokeWidth={STROKE} color={c.accent} strokeCap="round" /> : null}
          </Canvas>
          <View style={s.mid} pointerEvents="none"><Text variant="small" weight="bold">{pct}%</Text></View>
        </View>
        <View style={s.text}>
          <Text variant="h4">{t("admStudioD.ov.title")}</Text>
          <Text variant="small" tone="gray">{reg ? t("admStudioD.ov.ctors", { done, total }) : " "}</Text>
          <Text variant="small" tone="gray">{reg ? t("admStudioD.ov.groups", { n: groups.length, done: full }) : " "}</Text>
        </View>
      </View>
      <View style={[s.rule, { backgroundColor: c.line }]} />
      <View style={s.total}>
        <Image source={KPI_ART.total} resizeMode="contain" style={s.artBig} accessible={false} />
        <View style={s.fill}>
          <Text variant="caption" tone="gray">{t("admStudioD.ov.total")}</Text>
          <Text variant="h2" style={s.num}>{tiles[0].value ?? "—"}</Text>
        </View>
        <Text variant="small" weight="semibold" tone="gray">{tiles[0].hint}</Text>
      </View>
      <View style={[s.bar, { backgroundColor: c.surface2 }]} accessibilityElementsHidden>
        {stages.filter((x) => x.value).map((x) => <View key={x.key} style={{ flex: x.value ?? 0, backgroundColor: x.color }} />)}
      </View>
      <View style={s.list}>
        {stages.map((x) => (
          <View key={x.key} style={[s.row, { backgroundColor: c.surface2 }]}>
            <View style={[s.edge, { backgroundColor: x.color }]} />
            <Image source={KPI_ART[x.key]} resizeMode="contain" style={s.art} accessible={false} />
            <View style={s.fill}>
              <Text variant="small" weight="semibold" numberOfLines={1}>{t(`admStudioD.ov.${x.key}`)}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{x.hint}</Text>
            </View>
            <Text variant="h4" style={{ color: x.value ? x.color : c.gray2 }}>{x.value ?? "—"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 18, overflow: "hidden" },
  glow: { position: "absolute", top: -90, left: -70, width: 260, height: 220, borderRadius: 130 },
  head: { flexDirection: "row", alignItems: "center", gap: 16 },
  ring: { width: RING, height: RING },
  mid: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 4 },
  fill: { flex: 1 },
  rule: { height: StyleSheet.hairlineWidth },
  total: { flexDirection: "row", alignItems: "center", gap: 12 },
  artBig: { width: 56, height: 56, marginLeft: -4 },
  num: { fontSize: 30, lineHeight: 36 },
  bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 60, paddingRight: 14, borderRadius: 14, overflow: "hidden" },
  edge: { width: 5, alignSelf: "stretch" },
  art: { width: 40, height: 40 },
});
