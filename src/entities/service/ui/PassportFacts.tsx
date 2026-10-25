import { StyleSheet, View } from "react-native";
import { fixedCell, useGrid } from "@/shared/lib/useGrid";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Pill, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { valueKey } from "../lib/passportValues";
import type { ServicePassport } from "../model/passportTypes";
import type { Service } from "../model/types";

type Row = { label: string; value?: string; mono?: boolean };
const real = (v?: string): string => (v && !/^(none|null|undefined|-|—|0)$/i.test(v.trim()) ? v.trim() : "");

function Section({ i, icon, title, children }: { i: number; icon: IconName; title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(i * 70).duration(280)} style={[s.section, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={s.head}>
        <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={16} color={c.accent} /></View>
        <Text variant="small" weight="bold">{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

// Label over value, two to a row; empty values are left out so a section never shows a blank.
function Grid({ rows }: { rows: Row[] }) {
  const c = useColors();
  const grid = useGrid({ gap: 8, min: 220 });
  return (
    <View style={[s.grid, grid.row]} onLayout={grid.onLayout}>
      {grid.ready ? rows.filter((r) => real(r.value)).map((r) => (
        <View key={r.label} style={[s.cell, { backgroundColor: c.surface2 }, fixedCell(grid.tile)]}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{r.label}</Text>
          <Text variant="small" weight="bold" selectable={r.mono} numberOfLines={3} style={r.mono ? s.mono : undefined}>{real(r.value)}</Text>
        </View>
      )) : null}
    </View>
  );
}

// The service passport as sections of tiles — identity, timing, price, guarantees and the papers to bring. A section with
// nothing to say is not drawn.
export function PassportFacts({ service, passport: p }: { service: Service; passport: ServicePassport }) {
  const { t } = useT();
  const c = useColors();
  const val = (group: string, raw?: string) => {
    const k = valueKey(raw);
    return k ? t(`csv.pp.${group}.${k}`) : real(raw);
  };
  // Durations are day counts as text ("10", "3-5"); text that already carries a unit stays as written.
  const days = (v: string) => (!real(v) ? "" : /[^\d\s.,–-]/.test(v) ? v : t("csv.pp.daysText", { value: v }));
  const family = real(p.family) || service.categoryTitle || "";
  const identity: Row[] = [
    { label: t("csv.pp.code"), value: p.catalogCode || service.catalogCode, mono: true },
    { label: t("csv.pp.family"), value: p.group && p.group !== p.family ? `${family} · ${p.group}` : family },
    { label: t("csv.pp.subcategory"), value: p.subcategory && p.subcategory !== p.family ? p.subcategory : "" },
    { label: t("csv.pp.executor"), value: val("executorValues", p.executorType || service.executorType) },
    { label: t("csv.pp.format"), value: val("formatValues", p.format) },
  ];
  const term: Row[] = [{ label: t("csv.pp.standardTerm"), value: days(p.standardDuration) }, { label: t("csv.pp.urgentTerm"), value: days(p.urgentDuration) }];
  const price: Row[] = [{ label: t("csv.pp.price"), value: p.standardPrice ? `${fmtMoney(p.standardPrice)} ${t("common.currency")}` : "" }, { label: t("csv.pp.pricingTier"), value: val("tierValues", p.pricingTier) }];
  const care: Row[] = [{ label: t("csv.pp.sla"), value: p.slaCode }, { label: t("csv.pp.refund"), value: p.refundCode }];
  const has = (rows: Row[]) => rows.some((r) => real(r.value));
  let n = 0;
  return (
    <View style={s.col}>
      {has(identity) || p.advokatRequired ? (
        <Section i={n++} icon="info" title={t("csv.pp.blockIdentity")}>
          {p.advokatRequired ? <Pill label={t("csv.pp.advokatYes")} tone="warn" icon="shield" small /> : null}
          <Grid rows={identity} />
        </Section>
      ) : null}
      {has(term) ? <Section i={n++} icon="clock" title={t("csv.pp.blockDuration")}><Grid rows={term} /></Section> : null}
      {has(price) ? <Section i={n++} icon="credit-card" title={t("csv.pp.blockPricing")}><Grid rows={price} /></Section> : null}
      {has(care) ? <Section i={n++} icon="shield" title={t("csv.pp.blockSla")}><Grid rows={care} /></Section> : null}
      <Section i={n++} icon="paperclip" title={t("csv.pp.documents")}>
        {p.requiredDocuments.length ? p.requiredDocuments.map((d, i) => <View key={i} style={s.doc}><Icon name="check-circle" size={16} color={c.ok} /><Text variant="small" style={s.flex}>{d}</Text></View>) : (
          <View style={[s.none, { backgroundColor: c.okBg }]}><Icon name="check" size={16} color={c.ok} /><Text variant="small" style={[s.flex, { color: c.ok }]}>{t("csv.pp.noDocuments")}</Text></View>
        )}
      </Section>
      {p.version ? <Text variant="caption" tone="gray" center>{t("csv.pp.versionShort", { v: p.version })}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  section: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { flexBasis: "47%", flexGrow: 1, gap: 3, padding: 10, borderRadius: 14 },
  mono: { letterSpacing: 0.5 },
  doc: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  none: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 14 },
  flex: { flex: 1 },
});
