import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { IconButton } from "@/shared/ui";
import { ActionList, AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { useDocSettings } from "@/entities/doc-settings";
import { docPath } from "@/entities/my-document";
import { RatingSheet, ReviewSheet, useDocList, useDocRealtime } from "@/features/my-documents";
import { DocDetailSheet, DocList, DocListHeader } from "@/widgets/my-documents";

// A sheet must be gone before the next one (review, rating) or another screen opens over it.
const HAND_OFF = 320;

// "Mening hujjatlarim" (TZ 15): every document the client started, in any mode, with its status. Ten at a time; a tap on a
// card opens its detail sheet (the full page /documents/[id] stays one tap further). The "new" menu offers only the document service
// modes the platform keeps on; one outside the plan carries a lock and its page says why (TZ.md §4).
export default function MyDocumentsPage() {
  const { t } = useT();
  const router = useRouter();
  const ds = useDocSettings();
  const l = useDocList();
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState("");
  const shown = useKept(open || null) ?? ""; // keeps the content while the sheet slides out
  const [send, setSend] = useState("");
  const [rate, setRate] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useDocRealtime();
  useEffect(() => () => clearTimeout(timer.current), []);
  const go = (path: string) => router.push(path as never);
  const later = (fn: () => void) => { setOpen(""); clearTimeout(timer.current); timer.current = setTimeout(fn, HAND_OFF); };
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
    <AdminPage title={t("dm1.title")} subtitle={l.countsLoading ? t("dm1.lead") : t("docSheet.count", { n: l.counts.all ?? 0 })} right={<IconButton icon="plus" label={t("dm1.new")} onPress={() => setMenu(true)} />}>
      <DocList
        rows={l.items}
        query={l.query}
        page={l.page}
        filtered={filtered}
        onOpen={setOpen}
        onSend={setSend}
        onReset={l.reset}
        onBrowse={() => go("/services")}
        header={<DocListHeader counts={l.counts} modeCounts={l.modeCounts} statusCounts={l.statusCounts} total={l.total} loading={l.countsLoading} group={l.group} mode={l.mode} q={l.q} status={l.status} seen={l.seen} onStatus={l.setStatus} onGroup={l.setGroup} onMode={l.setMode} onQuery={l.setQ} />}
      />
      <DocDetailSheet
        id={shown}
        row={l.items.find((r) => r.id === shown)}
        visible={!!open}
        onClose={() => setOpen("")}
        onDetail={(id) => later(() => go(docPath(id)))}
        onSend={(id) => later(() => setSend(id))}
        onRate={(id) => later(() => setRate(id))}
      />
      <ReviewSheet docId={send} visible={!!send} onClose={() => setSend("")} />
      <RatingSheet docId={rate} visible={!!rate} onClose={() => setRate("")} />
      <ActionList visible={menu} onClose={() => setMenu(false)} title={t("dm1.new")} actions={actions} />
    </AdminPage>
  );
}
