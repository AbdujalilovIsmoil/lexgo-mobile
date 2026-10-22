import { useMemo, useState, type ReactNode } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useOfferedServiceIds } from "@/entities/lawyer";
import { useResponseNote } from "@/entities/response-window";
import type { Service } from "@/entities/service";
import { useTemplateDownload } from "@/features/service-open";
import { PreSellerBanner } from "@/widgets/services-catalog";
import { DocCatalog } from "@/widgets/doc-catalog";
import { MoreWays, ServicesHub, useServicesHub } from "@/widgets/services-hub";
import { TabPage, useTabPad, TabScrollView } from "@/widgets/tab-page";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { CatalogSheets } from "./CatalogSheets";
import { useDeepService } from "./useDeepService";

type Params = { cat?: string; subcat?: string; q?: string; lawyer?: string; name?: string; service?: string; package?: string };

// The Services tab — "Huquqiy hujjatlar": the ready-documents catalogue (every template, search and filters, a tap opens the template's own page),
// then the other ways in (AI intake, urgent advocate, a document written from scratch). When a directory advocate was picked (?lawyer=…) the tab
// is that advocate's service list instead (the old hub), narrowed to what they sell.
// Sheets: new-document order, the order form (advocate, price, payment), the download plan gates.
export function ServicesPage() {
  const { t } = useT();
  const p = useLocalSearchParams<Params>();
  const [pre, setPre] = useState<{ id: string; name: string } | null>(() => (p.lawyer ? { id: String(p.lawyer), name: String(p.name ?? "") } : null));
  const [order, setOrder] = useState<Service | null>(null);
  const [newDoc, setNewDoc] = useState(false);
  const dl = useTemplateDownload();
  useDeepService(String(p.service ?? ""), setOrder);
  const sheets = <CatalogSheets order={order} onOrder={setOrder} newDoc={newDoc} onNewDoc={setNewDoc} dl={dl} pre={pre ?? undefined} packageId={p.package ? String(p.package) : undefined} />;
  if (pre) return <AdvocateServices pre={pre} onClear={() => setPre(null)} onOrder={setOrder} onNewDoc={() => setNewDoc(true)} sheets={sheets} />;
  return (
    <TabPage title={t("dcat.title")} subtitle={t("dcat.lead")}>
      <DocCatalog footer={<MoreWays onNewDoc={() => setNewDoc(true)} />} />
      {sheets}
    </TabPage>
  );
}

type Advocate = { pre: { id: string; name: string }; onClear: () => void; onOrder: (s: Service) => void; onNewDoc: () => void; sheets: ReactNode };

// The services of one directory advocate (the tab opened from the lawyers list): the old services hub, narrowed to what they offer.
function AdvocateServices({ pre, onClear, onNewDoc, sheets }: Advocate) {
  const { t } = useT();
  const qc = useQueryClient();
  const router = useRouter();
  const pad = useTabPad();
  const c = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const note = useResponseNote();
  const offeredIds = useOfferedServiceIds(pre.id);
  // null = not loaded yet; an empty set = the advocate has not listed services (the whole catalogue stays).
  const offered = useMemo(() => (!offeredIds.isPending ? new Set(offeredIds.data ?? []) : null), [offeredIds.isPending, offeredIds.data]);
  const hub = useServicesHub(offered);
  const open = (sv: Service) => router.push({ pathname: "/services/[id]", params: { id: sv.id, lawyer: pre.id, name: pre.name } } as never);
  const refresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ predicate: (query) => /^(service|services|match|offered)/.test(String(query.queryKey[0])) });
    setRefreshing(false);
  };
  return (
    <TabPage title={t("csv.title")} subtitle={t("csv.lead")}>
      <TabScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={c.accent} />} contentContainerStyle={{ ...s.content, paddingBottom: pad }}>
        <PreSellerBanner name={pre.name} offered={offered} narrowed={!!offered?.size} afterHours={note.afterHours} respondBy={note.respondBy} onClear={onClear} />
        <ServicesHub hub={hub} onOpen={open} />
        <MoreWays onNewDoc={onNewDoc} />
        {sheets}
      </TabScrollView>
    </TabPage>
  );
}

const s = StyleSheet.create({ content: { paddingTop: 4, paddingHorizontal: 16, gap: 14 } });
