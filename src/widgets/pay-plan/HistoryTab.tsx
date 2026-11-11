import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowUpDown, ChartColumn, CircleCheck, CircleX, Clock, Layers, RotateCcw, Search, SlidersHorizontal, Wallet, type LucideIcon } from "lucide-react-native";
import { fmtUzs, groupOf, paymentTitle, PaymentStatusPill, phaseOf, statusLabel, usePayments, type PayGroup, type PaymentRow, type PayPhase } from "@/entities/payment";
import { PaymentFilterSheet } from "@/widgets/payments";
import { brand, useTheme } from "@/shared/theme";
import { EmptyState, PressableScale, Text } from "@/shared/ui";
import { DonutChart, type Slice } from "@/shared/ui/charts";
import { useDateRange } from "@/shared/ui/admin";
import { RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { HelpCard, IconTile, Panel, SectionTitle } from "./parts";
import { categoryOf, CATEGORIES, CATEGORY_COLOR } from "./category";

const GROUPS: Exclude<PayGroup, "all">[] = ["paid", "pending", "failed", "refunded"];
const PHASE_ICON: Record<PayPhase, LucideIcon> = { pending_confirmation: Clock, awaiting: Clock, paid: CircleCheck, failed: CircleX, cancelled: CircleX, refunded: RotateCcw };

function PayRow({ item, onPress }: { item: PaymentRow; onPress: () => void }) {
  const { colors: c } = useTheme();
  const { t, locale } = useT();
  const phase = phaseOf(item);
  const tone = phase === "paid" ? c.ok : phase === "refunded" ? c.gray : phase === "failed" || phase === "cancelled" ? c.err : c.warn;
  const Glyph = PHASE_ICON[phase];
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" style={s.row}>
      <View style={[s.dot, { backgroundColor: `${tone}22`, borderColor: `${tone}40` }]}><Glyph size={24} color={tone} strokeWidth={2} /></View>
      <View style={s.rowBody}>
        <Text variant="body" weight="bold" numberOfLines={1}>{paymentTitle(item, t)}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{fmtDateTime(item.createdAt, locale)}</Text>
      </View>
      <View style={s.rowRight}>
        <Text variant="body" weight="bold" numberOfLines={1}>{fmtUzs(item.amount, t)}</Text>
        <PaymentStatusPill status={item.status} method={item.method} />
      </View>
    </PressableScale>
  );
}

function Stat({ icon, color, label, value }: { icon: LucideIcon; color: string; label: string; value: string }) {
  return (
    <View style={s.stat}>
      <IconTile icon={icon} color={color} size={44} />
      <View style={s.flex}>
        <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
        <Text variant="h4" numberOfLines={1} adjustsFontSizeToFit style={s.statValue}>{value}</Text>
      </View>
    </View>
  );
}

// "To'lovlar tarixi": totals, what the money went to (by payment kind), search + status chips + period sheet, and the list of
// GET /payments — newest or oldest first, ten at a time; a tap opens the receipt.
export function HistoryTab() {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const q = usePayments();
  const bar = useDateRange("all");
  const [group, setGroup] = useState<PayGroup>("all");
  const [search, setSearch] = useState("");
  const [oldFirst, setOldFirst] = useState(false);
  const [sheet, setSheet] = useState(false);
  const needle = useDebounced(search.trim().toLowerCase(), 250);
  const all = q.data ?? [];
  const inRange = (p: PaymentRow) => { const d = p.createdAt.slice(0, 10); return (!bar.range.from || !d || d >= bar.range.from) && (!bar.range.to || !d || d <= bar.range.to); };
  const period = all.filter(inRange);
  const paid = period.filter((p) => groupOf(p.status) === "paid");
  const total = paid.reduce((n, p) => n + p.amount, 0);
  const slices: Slice[] = CATEGORIES.map((k) => ({ label: t(`pps.cat.${k}`), color: CATEGORY_COLOR[k], value: paid.filter((p) => categoryOf(p) === k).reduce((n, p) => n + p.amount, 0) }));
  const base = period.filter((p) => !needle || `${paymentTitle(p, t)} ${statusLabel(p.status, t)} ${p.amount} ${fmtMoney(p.amount)}`.toLowerCase().includes(needle));
  const counts = Object.fromEntries([["all", base.length], ...GROUPS.map((g) => [g, base.filter((p) => groupOf(p.status) === g).length])]) as Record<PayGroup, number>;
  const rows = (group === "all" ? base : base.filter((p) => groupOf(p.status) === group)).slice().sort((a, b) => (oldFirst ? 1 : -1) * a.createdAt.localeCompare(b.createdAt));
  const page = useShowMore(rows, `${group}|${needle}|${bar.range.from}|${bar.range.to}|${oldFirst}`);
  const chips: PayGroup[] = ["all", ...GROUPS.filter((g) => g !== "refunded" || counts.refunded > 0)];
  const filtered = group !== "all" || bar.preset !== "all";
  if (q.isLoading) return <View style={s.gap}><SectionTitle icon={ChartColumn} title={t("pps.overview")} /><RowsSkeleton /></View>;
  if (!all.length) {
    return (
      <View style={s.gap}>
        <Panel><EmptyState compact icon="credit-card" title={t("py1.empty")} text={t("py1.emptyText")} /></Panel>
        <HelpCard text={t("pps.payHelp")} />
      </View>
    );
  }
  return (
    <View style={s.gap}>
      <SectionTitle icon={ChartColumn} title={t("pps.overview")} />
      <Panel style={s.stats}>
        <Stat icon={Wallet} color={c.ok} label={t("pps.total")} value={fmtUzs(total, t)} />
        <View style={[s.sep, { backgroundColor: c.line }]} />
        <Stat icon={Layers} color={dark ? c.accent : brand.b600} label={t("pps.count")} value={String(period.length)} />
      </Panel>

      {total > 0 ? (
        <>
          <SectionTitle icon={Layers} title={t("pps.byCat")} />
          <Panel><DonutChart slices={slices} format={(n) => fmtMoney(n)} /></Panel>
        </>
      ) : null}

      <View style={s.searchRow}>
        <View style={[s.search, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Search size={20} color={c.gray} />
          <TextInput value={search} onChangeText={setSearch} placeholder={t("py1.searchPh")} placeholderTextColor={c.gray2} style={[s.input, { color: c.ink }]} returnKeyType="search" clearButtonMode="while-editing" />
        </View>
        <PressableScale onPress={() => setSheet(true)} scale={0.94} accessibilityRole="button" accessibilityLabel={t("dm11.filters")} style={[s.square, { backgroundColor: c.surface, borderColor: filtered ? c.accent : c.line }]}>
          <SlidersHorizontal size={20} color={c.accent} />
          {filtered ? <View style={[s.badge, { backgroundColor: c.accent }]} /> : null}
        </PressableScale>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.chipScroll}>
        {chips.map((g) => {
          const on = g === group;
          return (
            <PressableScale key={g} onPress={() => setGroup(g)} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={[s.chip, on ? { backgroundColor: brand.b600, borderColor: brand.b600 } : { backgroundColor: c.surface, borderColor: c.line }]}>
              <Text variant="small" weight="semibold" style={{ color: on ? "#FFFFFF" : c.ink }}>{t(`pps.chip.${g}`)}</Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      <SectionTitle icon={Layers} title={t("pps.list")} right={
        <PressableScale onPress={() => setOldFirst((v) => !v)} scale={0.92} hitSlop={8} accessibilityRole="button" accessibilityLabel={t(oldFirst ? "pps.sortOld" : "pps.sortNew")} style={[s.sort, { backgroundColor: dark ? c.surface2 : c.tint }]}>
          <ArrowUpDown size={18} color={c.accent} />
        </PressableScale>
      } />
      <Panel style={s.list}>
        {rows.length ? (
          <>
            {page.visible.map((p, i) => (
              <View key={p.id} style={i ? [s.divided, { borderTopColor: c.line }] : null}>
                <PayRow item={p} onPress={() => router.push(`/payments/${p.id}`)} />
              </View>
            ))}
            <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
          </>
        ) : <EmptyState compact icon="search" title={t("py1.noResults")} text={t("py1.noResultsText")} />}
      </Panel>

      <HelpCard text={t("pps.payHelp")} />
      <PaymentFilterSheet visible={sheet} onClose={() => setSheet(false)} group={group} onGroup={setGroup} counts={counts} bar={bar} total={counts[group]} onReset={() => { setGroup("all"); bar.setPreset("all"); }} />
    </View>
  );
}

const s = StyleSheet.create({
  gap: { gap: 14 },
  flex: { flex: 1 },
  stats: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 18 },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  statValue: { fontSize: 18, lineHeight: 23 },
  sep: { width: 1, alignSelf: "stretch" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 50, borderRadius: 999, borderWidth: 1, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 0 },
  square: { width: 50, height: 50, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  chipScroll: { marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sort: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { paddingVertical: 4 },
  divided: { borderTopWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  dot: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 3 },
  rowRight: { alignItems: "flex-end", gap: 5, maxWidth: "46%" },
});
