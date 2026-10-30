import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { IconButton } from "@/shared/ui";
import { ActionList, AdminPage } from "@/shared/ui/admin";
import { RA_OPENER, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useDocSettings } from "@/entities/doc-settings";
import { docPath } from "@/entities/my-document";
import { ReviewSheet, useDocList, useDocRealtime } from "@/features/my-documents";
import { DocList, DocListHeader } from "@/widgets/my-documents";

// "Mening hujjatlarim" (TZ 15): every document the client started, in any mode, with its status. Ten at a time; a tap on a
// row opens the document's own page (/documents/[id]: timeline, payment, file, answers, advocate, review, rating). The "new" menu offers only the document service
// modes the platform keeps on; one outside the plan carries a lock and its page says why (TZ.md §4).
export default function MyDocumentsPage() {
  const { t } = useT();
  const router = useRouter();
  const ds = useDocSettings();
  const l = useDocList();
  const [menu, setMenu] = useState(false);
  const [send, setSend] = useState("");
  useDocRealtime();
  // Remote assistance (`client.my_documents`): the "new" menu here, the filters and the cards in the list widgets.
  useRaPage("client.my_documents");
  const newRa = useRaControl({
    id: "my_documents.new",
    label: t("ra.el.docNew"),
    actions: RA_OPENER,
    state: menu ? "selected" : "ready",
    open: () => {
      setMenu(true);
      return raOk();
    },
  });
  const go = (path: string) => router.push(path as never);
  const filtered = !!(l.group || l.mode || l.status || l.q.trim());
  const modes = ds.offer([
    { key: "custom", mode: "lawyer" as const, label: t("dm1.menu.custom"), icon: "edit" as const, path: "/documents/new?kind=custom" },
    { key: "review", mode: "review" as const, label: t("dm1.menu.review"), icon: "search" as const, path: "/documents/new?kind=review" },
    { key: "analysis", mode: "analysis" as const, label: t("dm1.menu.analysis"), icon: "cpu" as const, path: "/doc-analysis" },
  ]);
  const actions = [
    { key: "svc", label: t("dm1.menu.services"), icon: "grid" as const, onPress: () => go("/services") },
    ...modes.map((m) => ({ key: m.key, label: m.label, icon: m.gate.state === "locked" ? ("lock" as const) : m.icon, onPress: () => go(m.path) })),
  ];
  return (
    <AdminPage title={t("dm1.title")} subtitle={l.countsLoading ? t("dm1.lead") : t("docSheet.count", { n: l.counts.all ?? 0 })} right={<View {...newRa}><IconButton icon="plus" label={t("dm1.new")} onPress={() => setMenu(true)} /></View>}>
      <DocList
        rows={l.items}
        query={l.query}
        page={l.page}
        filtered={filtered}
        onOpen={(id) => go(docPath(id))}
        onSend={setSend}
        onReset={l.reset}
        onBrowse={() => go("/services")}
        header={<DocListHeader counts={l.counts} modeCounts={l.modeCounts} statusCounts={l.statusCounts} total={l.total} loading={l.countsLoading} group={l.group} mode={l.mode} q={l.q} status={l.status} seen={l.seen} onStatus={l.setStatus} onGroup={l.setGroup} onMode={l.setMode} onQuery={l.setQ} />}
      />
      <ReviewSheet docId={send} visible={!!send} onClose={() => setSend("")} />
      <ActionList visible={menu} onClose={() => setMenu(false)} title={t("dm1.new")} actions={actions} />
    </AdminPage>
  );
}
