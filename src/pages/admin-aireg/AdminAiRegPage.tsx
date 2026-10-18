import { useState } from "react";
import { View } from "react-native";
import { useGate, useGaps, useReglaments, isOpenGap, resolveReglament, type Gap, type Reglament } from "@/entities/admin-aireg";
import { ReglamentEditor, UploadSheet, type EditorMode } from "@/features/admin-aireg";
import { GapsTab, ReglamentsTab } from "@/widgets/admin-aireg";
import { AdminPage } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { IconButton, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Tab = "list" | "gaps";

// AI support-assistant reglaments (the rule documents it answers from) and the questions it could not answer.
export default function AdminAiRegPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("list");
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editBusy, setEditBusy] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const list = useReglaments().data;
  const gaps = useGaps("open").data;
  const items: Reglament[] = list?.kind === "ok" ? list.data : [];
  const [createMissing, updateMissing, uploadMissing] = [useGate("create"), useGate("update"), useGate("upload")];
  const ready = list?.kind === "ok";
  const guard = (missing: boolean, fn: () => void) => (missing ? toast(t("adm.unavailable"), "info") : fn());
  const open = gaps?.kind === "ok" ? gaps.data.filter(isOpenGap).length : undefined;
  const tabs = [{ value: "list" as Tab, label: t("admAiReg.tabList"), count: ready ? items.length : undefined }, { value: "gaps" as Tab, label: t("admAiReg.tabGaps"), count: open, alert: true }];
  const edit = async (r: Reglament) => {
    if (editBusy) return;
    setEditBusy(r.id);
    try { setEditor({ kind: "edit", reglament: await resolveReglament(r) }); } finally { setEditBusy(""); }
  };
  const right = ready ? <><IconButton icon="upload" label={t("admAiReg.uploadCta")} onPress={() => guard(uploadMissing, () => setUploading(true))} /><IconButton icon="plus" label={t("admAiReg.newCta")} onPress={() => guard(createMissing, () => setEditor({ kind: "create" }))} /></> : undefined;
  return (
    <AdminPage title={t("admHub.mod.aiReglaments.title")} subtitle={t("admAiReg.lead")} right={right}>
      <View style={{ paddingBottom: 10 }}><CcTiles options={tabs} value={tab} onChange={(v) => setTab(v as Tab)} /></View>
      {tab === "list" ? <ReglamentsTab canEdit={ready && !updateMissing} editBusy={editBusy} onEdit={(r) => void edit(r)} /> : <GapsTab added={added} canAdd={ready && !(createMissing && updateMissing)} onAdd={(g: Gap) => setEditor({ kind: "gap", gap: g })} />}
      <ReglamentEditor mode={editor} reglaments={items} onClose={() => setEditor(null)} onSaved={(k) => { setEditor(null); if (k) setAdded((a) => [...a, k]); }} />
      <UploadSheet visible={uploading} reglaments={items} onClose={() => setUploading(false)} onDone={() => { setUploading(false); setTab("list"); }} />
    </AdminPage>
  );
}
