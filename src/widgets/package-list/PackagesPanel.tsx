import { useMemo, useState, type ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Button, EmptyState, Icon, Skeleton, Text, confirmDialog, useErrorText } from "@/shared/ui";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { isForbidden } from "@/shared/api/errors";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { FILTERS, countStates, groupRows, useEnablePackage, usePausePackage, useResumePackage, useSellerPackages, type PackageFilter, type SellerPackage } from "@/entities/seller-package";
import { PackagesHero } from "./PackagesHero";
import { TierCard } from "./TierCard";

type Props = {
  // Pull-to-refresh of the host: shown on the spinner and called next to the panel's own refetch.
  refreshing?: boolean;
  onRefresh?: () => void;
  // false: render a plain View (no ScrollView) so a host that already scrolls can embed the panel. Default true.
  scroll?: boolean;
  // Extra content above the hero (e.g. the host's own header), scrolls with the panel.
  header?: ReactNode;
};

// The whole "Paketlar" tab: hero + counters, price-lock notice, filters, a block per package with a card per tariff,
// confirm + enable / pause / resume, skeleton, error + retry, empty state. No page chrome.
export function PackagesPanel({ refreshing, onRefresh, scroll = true, header }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const errText = useErrorText();
  const q = useSellerPackages();
  const enable = useEnablePackage();
  const pause = usePausePackage();
  const resume = useResumePackage();
  const [filter, setFilter] = useState<PackageFilter>("all");
  const [search, setSearch] = useState("");
  const items = useMemo(() => q.data ?? [], [q.data]);
  const counts = useMemo(() => countStates(items), [items]);
  const groups = useMemo(() => groupRows(items, filter, search), [items, filter, search]);
  const busyId = enable.isPending ? enable.variables : pause.isPending ? pause.variables : resume.isPending ? resume.variables : "";

  const ask = (kind: "enable" | "disable" | "activate", row: SellerPackage, run: (id: string) => void) => {
    const key = kind === "disable" ? "disable" : kind;
    const name = `${row.pkg.groupTitle || row.pkg.title} · ${row.pkg.tariff}`;
    confirmDialog({
      title: t(`pkgSeller.confirm.${key}Title`),
      message: t(`pkgSeller.confirm.${key}Text`, { name }),
      confirmLabel: t(`pkgSeller.${kind}`),
      cancelLabel: t("pkgSeller.cancel"),
      icon: kind === "disable" ? "pause" : "play",
      onConfirm: () => run(row.id),
    });
  };

  const refetch = () => { void q.refetch(); onRefresh?.(); };

  let body: ReactNode;
  if (q.isLoading) {
    body = (
      <View style={s.gap} accessibilityRole="progressbar" accessibilityState={{ busy: true }}>
        <Skeleton height={196} round={radius.rx} />
        <Skeleton height={52} round={radius.r} />
        <Skeleton height={260} round={radius.rl} />
      </View>
    );
  } else if (q.isError && !q.data) {
    const locked = isForbidden(q.error);
    body = (
      <View style={[s.state, { backgroundColor: c.glassFill, borderColor: c.glassLine }]} accessibilityRole="alert">
        <View style={[s.stIc, { backgroundColor: locked ? c.tint2 : c.errBg }]}>
          <Icon name={locked ? "lock" : "alert-circle"} size={24} color={locked ? c.accent : c.err} />
        </View>
        <Text variant="h4" center>{t(locked ? "pkgSeller.lockedTitle" : "pkgSeller.errorTitle")}</Text>
        <Text variant="small" tone="gray" center>{locked ? t("pkgSeller.lockedText") : errText(q.error) || t("pkgSeller.errorText")}</Text>
        {locked ? null : <Button title={t("pkgSeller.retry")} icon="refresh-cw" variant="line" size="sm" onPress={refetch} />}
      </View>
    );
  } else {
    body = (
      <>
        <PackagesHero counts={counts} />
        <View style={[s.rule, { backgroundColor: c.surface2 }]} accessible accessibilityLabel={t("pkgSeller.priceRule")}>
          <Icon name="lock" size={16} color={c.accent} />
          <Text variant="small" tone="gray" style={s.flex}>{t("pkgSeller.priceRule")}</Text>
        </View>
        {items.length ? (
          <>
            <View style={s.bleed}>
              <ChipBar value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: t(`pkgSeller.filters.${f}`), count: counts[f] }))} />
              <SearchBox value={search} onChangeText={setSearch} placeholder={t("pkgSeller.search")} />
            </View>
            {groups.length ? groups.map((g) => (
              <View key={g.code} style={s.gap}>
                <View style={s.head} accessibilityRole="header">
                  <Icon name="package" size={18} color={c.accent} />
                  <View style={s.flex}>
                    <Text variant="h4" numberOfLines={2}>{g.title}</Text>
                    <Text variant="caption" tone="gray">{[g.category, g.code].filter(Boolean).join(" · ")}</Text>
                  </View>
                </View>
                {g.rows.map((row) => (
                  <TierCard
                    key={row.id}
                    row={row}
                    busy={busyId === row.id}
                    onEnable={() => ask("enable", row, (id) => enable.mutate(id))}
                    onPause={() => ask("disable", row, (id) => pause.mutate(id))}
                    onResume={() => ask("activate", row, (id) => resume.mutate(id))}
                  />
                ))}
              </View>
            )) : (
              <View style={s.state}>
                <Icon name="search" size={22} color={c.gray} />
                <Text variant="body" weight="bold" center>{t("pkgSeller.noMatch")}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[s.state, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            <EmptyState icon="package" title={t("pkgSeller.empty")} text={t("pkgSeller.emptyText")} />
          </View>
        )}
      </>
    );
  }

  const content = <View style={[s.root, !scroll && s.rootEmbedded]}>{header}{body}</View>;
  if (!scroll) return content;
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={!!refreshing || (q.isRefetching && !q.isLoading)} onRefresh={refetch} />}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  rootEmbedded: { paddingTop: 0 },
  gap: { gap: 10 },
  flex: { flex: 1 },
  bleed: { marginHorizontal: -16, gap: 10 },
  rule: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.r },
  head: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  state: { alignItems: "center", gap: 8, padding: 20, borderRadius: radius.rl, borderWidth: StyleSheet.hairlineWidth },
  stIc: { width: 56, height: 56, borderRadius: radius.rl, alignItems: "center", justifyContent: "center" },
});
