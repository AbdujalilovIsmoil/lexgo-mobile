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
// title, and the records as five picture tiles — all the records (with the active ones), on the site, drafts, in review, awaiting
// publication. The numbers are the server's summary and the constructor registry, never counted from a page.
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
      <View style={s.grid}>
        {tiles.map((x, i) => (
          <View key={x.key} style={[s.tile, i === 0 && s.wide, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Image source={KPI_ART[x.key]} resizeMode="contain" style={s.art} accessible={false} />
            <Text variant="h2" style={s.num}>{x.value ?? "—"}</Text>
            <Text variant="small" weight="semibold" numberOfLines={1}>{t(`admStudioD.ov.${x.key}`)}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{x.hint || " "}</Text>
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48.4%", flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 2 },
  wide: { width: "100%" },
  art: { width: 52, height: 52, marginLeft: -6, marginTop: -6, marginBottom: 4 },
  num: { fontSize: 26, lineHeight: 32 },
});
