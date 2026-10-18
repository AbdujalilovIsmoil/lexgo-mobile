import { useMemo, useState } from "react";
import { filterServices, ServiceRow, type AdminService, useCategories, useServiceSearch, useServices, type StateFilter } from "@/entities/admin-services";
import { ServiceCreateSheet, ServiceEditSheet, useSheetTarget } from "@/features/admin-services";
import { CategoriesSheet, ServiceFilters, useServiceActions } from "@/widgets/admin-services";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

const STEP = 30;

// Services: hero numbers, searchable / filterable catalogue of tickets, category drawer, create, edit, soft-delete, reactivate.
export default function AdminServicesPage() {
  const { t, locale } = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [state, setState] = useState<StateFilter>("all");
  const [shown, setShown] = useState(STEP);
  const [panel, setPanel] = useState(false);
  const [creating, setCreating] = useState(false);
  const edit = useSheetTarget<AdminService>();
  const term = useDebounced(q.trim(), 300);
  const cats = useCategories();
  const list = useServices("", undefined, locale);
  const remote = useServiceSearch(term);
  const all = useMemo(() => list.data ?? [], [list.data]);
  const items = useMemo(() => filterServices(all, cat, state, term, term.length >= 2 && remote.data ? new Set(remote.data) : null), [all, cat, state, term, remote.data]);
  const act = useServiceActions();
  const paged = { isLoading: list.isLoading, isError: list.isError, error: list.error, refetch: list.refetch, isRefetching: list.isRefetching, hasNextPage: items.length > shown, fetchNextPage: () => setShown((n) => n + STEP) };
  const reset = <T,>(set: (v: T) => void) => (v: T) => { setShown(STEP); set(v); };
  return (
    <AdminPage title={t("admHub.mod.services.title")} right={<><ExportButton id="categories" /><IconButton icon="layers" onPress={() => setPanel(true)} /><IconButton icon="plus" onPress={() => setCreating(true)} /></>}>
      <PagedList
        data={items.slice(0, shown)}
        query={paged}
        keyExtractor={(s) => s.id}
        skeletonHeight={110}
        renderItem={(s) => <ServiceRow item={s} onEdit={() => edit.open(s)} onDelete={() => act.remove(s)} onReactivate={() => act.reactivate(s)} />}
        empty={{ icon: "briefcase", title: all.length ? t("admSvc.noResults") : t("admSvc.empty") }}
        off={{ title: t("admSvcC.offTitle"), text: t("admSvcC.offText") }}
        header={list.data ? <ServiceFilters all={all} q={q} onQ={reset(setQ)} cat={cat} onCat={reset(setCat)} state={state} onState={reset(setState)} categories={cats.data ?? []} count={items.length} note={remote.isError && term.length >= 2 ? t("admSvc.serverSearchOff") : undefined} /> : null}
      />
      <CategoriesSheet visible={panel} onClose={() => setPanel(false)} />
      <ServiceCreateSheet visible={creating} categories={cats.data ?? []} onClose={() => setCreating(false)} />
      {edit.target ? <ServiceEditSheet key={edit.key} service={edit.target} visible={edit.visible} categories={cats.data ?? []} onClose={edit.close} /> : null}
    </AdminPage>
  );
}
