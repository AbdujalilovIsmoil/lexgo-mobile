import { useMemo, useState } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useOfferedServiceIds } from "@/entities/lawyer";
import { useResponseNote } from "@/entities/response-window";
import type { Service } from "@/entities/service";
import { useTemplateDownload } from "@/features/service-open";
import { PreSellerBanner } from "@/widgets/services-catalog";
import { MoreWays, ServicesHub, useServicesHub } from "@/widgets/services-hub";
import { TabPage, useTabPad, TabScrollView } from "@/widgets/tab-page";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { CatalogSheets } from "./CatalogSheets";
import { useDeepService } from "./useDeepService";

type Params = { cat?: string; subcat?: string; q?: string; lawyer?: string; name?: string; service?: string; package?: string };

// The Services tab: search, the directions as chips and the services right under them (a tap opens the service's own page),
// then the other ways in (AI intake, urgent advocate, a document written from scratch). A directory advocate, if one was picked, narrows the list.
// Sheets: new-document order, the order form (advocate, price, payment), the download plan gates.
export function ServicesPage() {
  const { t } = useT();
  const qc = useQueryClient();
  const router = useRouter();
  const pad = useTabPad();
  const c = useColors();
  const p = useLocalSearchParams<Params>();
  const [pre, setPre] = useState<{ id: string; name: string } | null>(() => (p.lawyer ? { id: String(p.lawyer), name: String(p.name ?? "") } : null));
  const [order, setOrder] = useState<Service | null>(null);
  const [newDoc, setNewDoc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dl = useTemplateDownload();
  const note = useResponseNote();
  const offeredIds = useOfferedServiceIds(pre?.id ?? "");
  // null = not loaded yet; an empty set = the advocate has not listed services (the whole catalogue stays).
  const offered = useMemo(() => (pre && !offeredIds.isPending ? new Set(offeredIds.data ?? []) : null), [pre, offeredIds.isPending, offeredIds.data]);
  const hub = useServicesHub(offered);
  useDeepService(String(p.service ?? ""), setOrder);
  const open = (sv: Service) => router.push({ pathname: "/services/[id]", params: { id: sv.id, ...(pre ? { lawyer: pre.id, name: pre.name } : {}) } } as never);
  const refresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ predicate: (query) => /^(service|services|match|offered)/.test(String(query.queryKey[0])) });
    setRefreshing(false);
  };
  return (
    <TabPage title={t("csv.title")} subtitle={t("csv.lead")}>
      <TabScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={c.accent} />} contentContainerStyle={{ ...s.content, paddingBottom: pad }}>
        {pre ? <PreSellerBanner name={pre.name} offered={offered} narrowed={!!offered?.size} afterHours={note.afterHours} respondBy={note.respondBy} onClear={() => setPre(null)} /> : null}
        <ServicesHub hub={hub} onOpen={open} />
        <MoreWays onNewDoc={() => setNewDoc(true)} />
        <CatalogSheets order={order} onOrder={setOrder} newDoc={newDoc} onNewDoc={setNewDoc} dl={dl} pre={pre ?? undefined} packageId={p.package ? String(p.package) : undefined} />
      </TabScrollView>
    </TabPage>
  );
}

const s = StyleSheet.create({ content: { paddingTop: 4, paddingHorizontal: 16, gap: 14 } });
