import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useOfferedServiceIds } from "@/entities/lawyer";
import type { Service } from "@/entities/service";
import { useTemplateDownload } from "@/features/service-open";
import { ServicesCatalog } from "@/widgets/services-catalog";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { CatalogSheets } from "./CatalogSheets";

// /services/direction?cat&subcat — one direction on a page of its own: its documents, with the filter row,
// search, the "new document" order and the same cards as the catalogue. The header's arrow goes back to the directions.
export function DirectionPage() {
  const { t } = useT();
  const insets = useInsets();
  const p = useLocalSearchParams<{ cat?: string; subcat?: string; lawyer?: string }>();
  const [order, setOrder] = useState<Service | null>(null);
  const [newDoc, setNewDoc] = useState(false);
  const dl = useTemplateDownload();
  const offeredIds = useOfferedServiceIds(String(p.lawyer ?? ""));
  const offered = useMemo(() => (p.lawyer && !offeredIds.isPending ? new Set(offeredIds.data ?? []) : null), [p.lawyer, offeredIds.isPending, offeredIds.data]);
  return (
    <AdminPage title={String(p.subcat ?? t("csv.title"))}>
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ServicesCatalog pinned init={{ cat: p.cat, subcat: p.subcat }} offered={offered} dl={dl} onNewDoc={() => setNewDoc(true)} onOrder={setOrder} />
      </ScrollView>
      <CatalogSheets order={order} onOrder={setOrder} newDoc={newDoc} onNewDoc={setNewDoc} dl={dl} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ content: { paddingTop: 4, paddingHorizontal: 16, gap: 14 } });
