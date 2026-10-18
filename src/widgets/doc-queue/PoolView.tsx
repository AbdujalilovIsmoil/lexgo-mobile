import { useRouter } from "expo-router";
import { IconButton } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { docPath, editorPath, useDocSync, useLocalPaged, usePool } from "@/entities/doc-queue";
import { PoolCard, useClaim } from "@/features/doc-pool";
import { DocFilters } from "./DocFilters";
import { useDocFilter } from "./useDocFilter";

// The open pool: take a request (claim race handled), then go straight to its editor.
export function PoolView() {
  const { t } = useT();
  const router = useRouter();
  const f = useDocFilter();
  const pool = usePool();
  const claim = useClaim((id) => router.replace(editorPath(id)));
  useDocSync();
  const items = f.apply(pool.data ?? []);
  const { shown, query } = useLocalPaged(pool, items, f.key);
  const filtered = !!pool.data?.length && !items.length;
  return (
    <AdminPage title={t("ad2.title")} subtitle={pool.data ? t("ad2.count", { n: pool.data.length }) : undefined} right={<IconButton icon={f.newest ? "arrow-down" : "arrow-up"} onPress={f.toggleSort} label={t("ad1.sort")} />}>
      <PagedList data={shown} query={query} keyExtractor={(d) => d.id} header={<DocFilters f={f} />} skeletonHeight={170}
        renderItem={(d) => <PoolCard doc={d} claiming={claim.isPending && claim.variables === d.id} onClaim={() => claim.mutate(d.id)} onOpen={() => router.push(docPath(d.id))} />}
        empty={{ icon: "inbox", title: filtered ? t("ad1.emptyFiltered") : t("ad2.empty"), text: filtered ? t("ad1.emptyFilteredText") : t("ad2.emptyText") }} />
    </AdminPage>
  );
}
