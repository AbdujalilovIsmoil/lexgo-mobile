import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { IconButton } from "@/shared/ui";
import { AdminPage, ChipBar, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { DOC_TABS, DocRow, docPath, useDocSync, useDocs, useLocalPaged, type DocTab } from "@/entities/doc-queue";
import { DocFilters } from "./DocFilters";
import { PoolBanner } from "./PoolBanner";
import { useDocFilter } from "./useDocFilter";

// "My document requests": status groups (each one a server-side filter), search, work type, sort, realtime refresh.
export function DocListView() {
  const { t } = useT();
  const router = useRouter();
  const pool = useAccess().callCenterLawyer;
  const [tab, setTab] = useState<DocTab>("claimed");
  const f = useDocFilter();
  const q = useDocs(tab);
  useDocSync();
  const items = f.apply(q.data ?? []);
  const { shown, query } = useLocalPaged(q, items, `${tab}|${f.key}`);
  const tabs = DOC_TABS.map((v) => ({ value: v, label: t(`ad1.tab.${v}`), count: v === tab && q.data ? items.length : undefined }));
  const filtered = !!q.data?.length && !items.length;
  const header = (
    <View>
      {pool ? <PoolBanner /> : null}
      <View style={{ marginHorizontal: -16, paddingBottom: 10 }}><ChipBar options={tabs} value={tab} onChange={setTab} /></View>
      <DocFilters f={f} />
    </View>
  );
  return (
    <AdminPage title={t("ad1.title")} subtitle={t("ad1.subtitle")} right={<IconButton icon={f.newest ? "arrow-down" : "arrow-up"} onPress={f.toggleSort} label={t("ad1.sort")} />}>
      <PagedList data={shown} query={query} keyExtractor={(d) => d.id} header={header} renderItem={(d) => <DocRow doc={d} onPress={() => router.push(docPath(d.id))} />} empty={{ icon: "file-text", title: filtered ? t("ad1.emptyFiltered") : t("ad1.empty"), text: filtered ? t("ad1.emptyFilteredText") : t(`ad1.emptyText.${tab}`) }} />
    </AdminPage>
  );
}
