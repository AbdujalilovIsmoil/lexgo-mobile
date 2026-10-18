import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { EmptyState, ErrorView, IconButton, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { StudioGate, nextMinor, useStudioText, type StudioVersion } from "@/entities/admin-studio";
import { useWorkspace, type RecordRef } from "@/features/admin-studio";
import { EditorCard, NoteSheet, ObjectBanners, ObjectFooter, ObjectHeader, PreviewSheet, SaveMetaSheet, ServerCheckSheet, SidePanes, VersionLine, type SideTab } from "@/widgets/admin-studio";
import { useInsets } from "@/shared/lib/insets";

type Dialog = null | "publish" | "archive" | "submitFree" | "rollback";

function ObjectScreen({ id, code, rec }: { id: string; code: string; rec?: RecordRef }) {
  const ws = useWorkspace(id, code, rec);
  const { t, ctorName } = useStudioText();
  const insets = useInsets();
  const [tab, setTab] = useState<SideTab>("versions");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [rollTo, setRollTo] = useState<StudioVersion | null>(null);
  const [preview, setPreview] = useState<StudioVersion | null>(null);
  const [meta, setMeta] = useState(false);
  const [check, setCheck] = useState(false);
  const open = (d: Dialog) => (ws.setError(""), setDialog(d));
  const finish = (ok: boolean) => ok && (setDialog(null), setMeta(false));
  const title = ws.code ? ctorName(ws.code, ws.ctor?.title) : t("admStudioB.screenTitle");
  const archiveShown = !ws.creating && ws.access.canArchive && ws.status !== "archived";
  if (ws.creating && ws.access.constructors.length > 0 && !ws.access.constructors.some((c) => c.code === code)) return <AdminPage title={title}><EmptyState icon="layers" title={t("admStudio.list.missingTitle")} text={t("admStudio.list.missingText", { code })} /></AdminPage>;
  if (ws.loadError) return <AdminPage title={title}><ErrorView error={ws.loadError} onRetry={ws.reload} /></AdminPage>;
  if (!ws.draft) return <AdminPage title={title}><View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={96} round={20} />)}</View></AdminPage>;
  return (
    <AdminPage
      title={title}
      subtitle={ws.code}
      right={<>{ws.access.canEdit ? <IconButton icon="shield" label={t("ag9.check.title")} onPress={() => setCheck(true)} /> : null}{archiveShown ? <IconButton icon="archive" label={t("admStudio.actions.archive")} onPress={() => open("archive")} /> : null}</>}
      footer={<ObjectFooter ws={ws} onSave={() => void ws.save()} onMeta={() => setMeta(true)} onSubmit={() => (ws.approvalFree ? open("submitFree") : void ws.submit())} onPublish={() => open("publish")} />}
    >
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <ObjectHeader ws={ws} />
        <ObjectBanners ws={ws} error={dialog || meta ? "" : ws.error} onFile={() => setTab("file")} onReload={() => ws.detail && ws.apply(ws.detail)} />
        <EditorCard ws={ws} />
        <SidePanes ws={ws} tab={tab} onTab={setTab} onPreview={setPreview} onRollback={(v) => (setRollTo(v), open("rollback"))} />
      </KeyboardAwareScrollView>
      <SaveMetaSheet visible={meta} onClose={() => setMeta(false)} suggest={nextMinor(ws.detail?.currentVersion || "1.0")} busy={ws.busy === "save"} onSave={async (m) => finish(await ws.save(m))} />
      <NoteSheet visible={dialog === "publish"} onClose={() => setDialog(null)} title={t("admStudioB.publish.title")} lead={t("admStudioB.publish.lead")} noteLabel={t("admStudioB.publish.note")} notePh={t("admStudioB.publish.notePh")} confirmLabel={t("admStudio.actions.publish")} busy={ws.busy === "publish"} error={ws.error} onConfirm={async (n) => finish(await ws.publish(n))} />
      <NoteSheet visible={dialog === "rollback"} onClose={() => setDialog(null)} title={t("admStudioB.rollback.title", { v: rollTo?.version || "—" })} lead={t("admStudioB.rollback.lead")} extra={rollTo ? <VersionLine version={rollTo} /> : null} noteLabel={t("admStudioB.rollback.note")} notePh={t("admStudioB.rollback.notePh")} confirmLabel={t("admStudioB.rollback.confirm")} busy={ws.busy === "rollback"} error={ws.error} onConfirm={async (n) => rollTo && finish(await ws.rollback(rollTo.id, rollTo.version, n))} />
      <NoteSheet visible={dialog === "archive"} onClose={() => setDialog(null)} title={t("admStudioB.archive.title")} lead={`${t("admStudioB.archive.lead")}${ws.dirty ? `\n${t("admStudioB.archive.dirty")}` : ""}`} confirmLabel={t("admStudio.actions.archive")} danger busy={ws.busy === "archive"} error={ws.error} onConfirm={async () => finish(await ws.archive())} />
      <NoteSheet visible={dialog === "submitFree"} onClose={() => setDialog(null)} title={t("admStudioB.submit.freeTitle")} lead={`${t("admStudioB.submit.freeLead")}${ws.dirty || ws.creating ? `\n${t("admStudioB.submit.freeSave")}` : ""}`} confirmLabel={t("admStudioB.submit.free")} busy={ws.busy === "submit" || ws.busy === "save"} error={ws.error} onConfirm={async () => finish(await ws.submit())} />
      <PreviewSheet version={preview} onClose={() => setPreview(null)} />
      <ServerCheckSheet ws={ws} visible={check} onClose={() => setCheck(false)} />
    </AdminPage>
  );
}

// Object editor: opens an existing object (`id`) or a new draft of constructor `code`.
export default function StudioObjectPage() {
  const { t } = useStudioText();
  const { id = "", code = "", record = "", source = "" } = useLocalSearchParams<{ id?: string; code?: string; record?: string; source?: string }>();
  return (
    <StudioGate need={id ? "any" : "edit"} title={t("admStudioB.screenTitle")}>
      <ObjectScreen key={id || `new:${code}:${record}`} id={id} code={code} rec={record ? { record, source } : undefined} />
    </StudioGate>
  );
}
