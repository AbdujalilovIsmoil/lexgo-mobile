import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton } from "@/shared/ui";
import { ActionList, AdminPage, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { docPath, sectionize } from "@/entities/my-document";
import { ReviewSheet, useDocList, useDocRealtime } from "@/features/my-documents";
import { DocListHeader, DocListItem, DocSectionHead } from "@/widgets/my-documents";

// "Mening hujjatlarim" (TZ 15): every document the client started, in any mode, with its status.
export default function MyDocumentsPage() {
  const { t } = useT();
  const router = useRouter();
  const l = useDocList();
  const [menu, setMenu] = useState(false);
  const [send, setSend] = useState("");
  useDocRealtime();
  const go = (path: string) => router.push(path as never);
  const filtered = !!(l.group || l.mode || l.status || l.q.trim());
  const empty = !l.query.isLoading && !l.query.isError && l.items.length === 0;
  const actions = [
    { key: "svc", label: t("dm1.menu.services"), icon: "grid" as const, onPress: () => go("/services") },
    { key: "custom", label: t("dm1.menu.custom"), icon: "edit" as const, onPress: () => go("/documents/new?kind=custom") },
    { key: "review", label: t("dm1.menu.review"), icon: "search" as const, onPress: () => go("/documents/new?kind=review") },
    { key: "analysis", label: t("dm1.menu.analysis"), icon: "cpu" as const, onPress: () => go("/doc-analysis") },
  ];
  return (
    <AdminPage title={t("dm1.title")} subtitle={t("dm1.lead")} right={<IconButton icon="plus" label={t("dm1.new")} onPress={() => setMenu(true)} />}>
      <PagedList
        data={sectionize(l.items)}
        query={l.query}
        keyExtractor={(r) => r.id}
        skeletonHeight={178}
        renderItem={(i) => (i.head ? <DocSectionHead kind={i.head} n={i.n ?? 0} /> : i.row ? <DocListItem row={i.row} onOpen={() => go(docPath(i.id))} onSend={setSend} /> : <View />)}
        empty={{ icon: filtered ? "search" : "file-text", title: filtered ? t("dm1.filterEmpty") : t("dm1.empty"), text: filtered ? t("dm1.filterEmptyText") : t("dm1.emptyText") }}
        header={
          <View>
            <DocListHeader counts={l.counts} statusCounts={l.statusCounts} total={l.total} loading={l.countsLoading} group={l.group} mode={l.mode} q={l.q} status={l.status} seen={l.seen} onStatus={l.setStatus} onGroup={l.setGroup} onMode={l.setMode} onQuery={l.setQ} />
            {empty && filtered ? <Button title={t("dm1.reset")} variant="soft" icon="rotate-ccw" size="sm" onPress={l.reset} style={{ marginBottom: 8 }} /> : null}
            {empty && !filtered ? <Button title={t("dm1.browse")} icon="grid" size="sm" onPress={() => go("/services")} style={{ marginBottom: 8 }} /> : null}
          </View>
        }
      />
      <ReviewSheet docId={send} visible={!!send} onClose={() => setSend("")} />
      <ActionList visible={menu} onClose={() => setMenu(false)} title={t("dm1.new")} actions={actions} />
    </AdminPage>
  );
}
