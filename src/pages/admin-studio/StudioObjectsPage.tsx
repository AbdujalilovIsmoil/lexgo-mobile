import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EmptyState, IconButton, confirmDialog } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { ObjectRow, StudioGate, archiveObject, listObjects, studioKeys, useStudioAccess, useStudioText, type StudioObject, type StudioRecord } from "@/entities/admin-studio";
import { CtorInfo, ObjectFilters, RecordsList, ViewSwitch, type ListView } from "@/widgets/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { usePaged } from "@/shared/lib/usePaged";
import { useT } from "@/shared/i18n";

function Objects({ code, initialStatus }: { code: string; initialStatus: string }) {
  const { t } = useT();
  const { ctorName } = useStudioText();
  const a = useStudioAccess();
  const router = useRouter();
  const ctor = a.constructors.find((c) => c.code === code) ?? null;
  const [status, setStatus] = useState(initialStatus);
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState("");
  const [view, setView] = useState<ListView>("objects");
  const catalog = ctor?.nav?.group === "services_packages";
  const { items, query } = usePaged(
    [...studioKeys.all, "objects", code, status, mine],
    ({ limit, offset }) => listObjects({ code, status, mine, limit, offset }).then((r) => ({ items: r.items, total: r.total, hasMore: offset + r.items.length < r.total })),
    { enabled: !!ctor },
  );
  const archive = useAdminMutation({ mutationFn: (id: string) => archiveObject(id), invalidate: [studioKeys.all], success: "admStudio.list.archived" });
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = terms.length ? items.filter((o) => terms.every((w) => [o.title, o.currentVersion, o.createdBy, o.assignedTo].join(" ").toLowerCase().includes(w))) : items;
  const open = (id: string) => router.push({ pathname: "/manage/studio/object", params: { id } } as never);
  const askArchive = (o: StudioObject) =>
    confirmDialog({ title: t("admStudio.list.archiveTitle"), message: t("admStudio.list.archiveText", { title: o.title || t("admStudio.list.untitled") }), confirmLabel: t("admStudio.actions.archive"), cancelLabel: t("adm.cancel"), icon: "archive", danger: true, onConfirm: async () => void (await archive.mutateAsync(o.id)) });
  const create = () => router.push({ pathname: "/manage/studio/object", params: { code } } as never);
  const openRecord = (r: StudioRecord) => (r.objectId ? open(r.objectId) : a.canEdit && router.push({ pathname: "/manage/studio/object", params: { code, record: r.id, source: r.source } } as never));
  const switcher = catalog ? <ViewSwitch value={view} onChange={setView} /> : null;
  if (!ctor) return <AdminPage title={code}><EmptyState icon="search" title={t("admStudio.list.missingTitle")} text={t("admStudio.list.missingText", { code })} /></AdminPage>;
  if (catalog && view === "records") return <AdminPage title={ctorName(code, ctor.title)} subtitle={ctor.description}><RecordsList code={code} group="services_packages" onOpen={openRecord} header={<View style={{ gap: 12, paddingBottom: 12 }}><CtorInfo code={code} ctor={ctor} />{switcher}</View>} /></AdminPage>;
  return (
    <AdminPage title={ctorName(code, ctor.title)} subtitle={ctor.description} right={a.canEdit ? <IconButton icon="plus" label={t("admStudio.list.new")} onPress={create} /> : undefined}>
      <PagedList
        skeletonHeight={110}
        data={shown}
        query={query}
        keyExtractor={(o) => o.id}
        renderItem={(o) => <ObjectRow item={o} onPress={() => open(o.id)} onArchive={a.canArchive ? () => askArchive(o) : undefined} archiving={archive.isPending && archive.variables === o.id} />}
        empty={{ icon: "inbox", title: t("admStudio.list.emptyTitle"), text: t(a.canEdit ? "admStudio.list.emptyText" : "admStudio.list.emptyRead", { name: ctorName(code, ctor.title) }) }}
        header={<View style={{ gap: 12, paddingBottom: 12 }}><CtorInfo code={code} ctor={ctor} />{switcher}<ObjectFilters status={status} onStatus={setStatus} mine={mine} onMine={setMine} q={q} onQ={setQ} /></View>}
      />
    </AdminPage>
  );
}

// Objects of one constructor: status filter, "assigned to me", search, paging, create and archive.
export default function StudioObjectsPage() {
  const { t } = useT();
  const { code = "", status = "" } = useLocalSearchParams<{ code?: string; status?: string }>();
  return <StudioGate need="any" title={t("admHub.mod.studio.title")}><Objects code={code} initialStatus={status} /></StudioGate>;
}
