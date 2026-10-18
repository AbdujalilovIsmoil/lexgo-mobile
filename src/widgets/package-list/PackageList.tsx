import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { type ServicePackage } from "@/entities/package";
import { EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { PackageGroup } from "./PackageGroup";
import { PackagePurchaseSheet } from "@/features/market-purchase";
import { PackageSheet } from "./PackageSheet";
import { usePackageList } from "./usePackageList";

// Client "Xizmat paketlari": note, search, category chips, a block per package, details drawer.
export function PackageList() {
  const { t } = useT();
  const insets = useInsets();
  const m = usePackageList();
  const [open, setOpen] = useState<ServicePackage | null>(null);
  const [buy, setBuy] = useState<ServicePackage | null>(null);
  if (m.pk.error && !m.pk.data) return <ErrorView error={m.pk.error} onRetry={() => void m.pk.refetch()} />;
  const loading = m.pk.isLoading;
  return (
    <>
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]} refreshControl={<RefreshControl refreshing={m.pk.isRefetching} onRefresh={() => void m.pk.refetch()} />} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text variant="small" tone="gray" style={s.pad}>{t("mk8.lead")}{loading ? "" : ` · ${t("mk8.count", { n: m.total })}`}</Text>
        <SearchBox value={m.q} onChangeText={m.setQ} placeholder={t("mk8.searchPh")} />
        {m.cats.length > 1 ? <ChipBar value={m.cat} onChange={m.setCat} options={[{ value: "", label: t("mk8.allCategories") }, ...m.catOpts.map((o) => ({ ...o, label: o.value }))]} /> : null}
        {loading ? <View style={s.pad}><Skeleton height={260} round={20} /></View>
          : !m.groups.length ? <EmptyState icon="briefcase" title={t("mk8.empty")} text={t("mk8.emptyText")} compact />
          : <View style={[s.pad, s.list]}>{m.groups.map(([code, items]) => <PackageGroup key={code} code={code} items={items} byCode={m.byCode} onDetails={setOpen} onOrder={setBuy} />)}</View>}
      </ScrollView>
      <PackageSheet pkg={open} onClose={() => setOpen(null)} onOrder={(p) => { setOpen(null); setBuy(p); }} />
      <PackagePurchaseSheet pkg={buy} onClose={() => setBuy(null)} />
    </>
  );
}

const s = StyleSheet.create({
  content: { gap: 12, paddingTop: 4 },
  pad: { paddingHorizontal: 16 },
  list: { gap: 22 },
});
