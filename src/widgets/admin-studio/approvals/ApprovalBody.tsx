import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Text, toast } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { PayloadView, StudioFlow, StudioStatusPill, downloadVersionFile, exportVersions, isApprovalFree, useStudioAccess, useStudioErrorText, useStudioText, type StudioDetail, type StudioStep } from "@/entities/admin-studio";
import { fmtDateTime } from "@/shared/lib/format";
import { CommentsPane } from "../object/CommentsPane";
import { ReassignSheet } from "./ReassignSheet";
import { StepsPane } from "../object/StepsPane";
import { currentStepOf, submittedOf, versionLabel, versionOf } from "./helpers";

// Scrollable content of the approval sheet: facts, data preview, file, steps, comments, shortcuts.
export function ApprovalBody({ d }: { d: StudioDetail }) {
  const { t, locale, role } = useStudioText();
  const a = useStudioAccess();
  const errText = useStudioErrorText();
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [reassign, setReassign] = useState<StudioStep | null>(null);
  const cur = versionOf(d);
  const sub = submittedOf(d);
  const at = currentStepOf(d);
  const free = isApprovalFree(d.code, a.constructors.find((c) => c.code === d.code));
  const ver = versionLabel(d);
  const act = (k: string, fn: () => Promise<void>) => (setBusy(k), fn().catch((e) => toast(errText(e), "err")).finally(() => setBusy("")));
  return (
    <>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><StudioStatusPill status={d.status} raw={d.statusRaw} small={false} />{ver ? <Text variant="small" tone="gray">v{ver}</Text> : null}</View>
      <StudioFlow status={d.status} raw={d.statusRaw} approvalFree={free} />
      <FactRows rows={[
        { label: t("admStudioC.drawer.sentBy"), value: sub.by },
        { label: t("admStudioC.drawer.sentAt"), value: fmtDateTime(sub.at, locale) },
        { label: t("admStudioC.drawer.step"), value: at ? t("admStudioC.card.step", { n: at.index + 1, total: at.total, name: at.step.title || role(at.step.role) }) : d.status === "approved" ? t("admStudioC.drawer.allApproved") : "" },
        { label: t("admStudioC.drawer.summary"), value: cur?.summary },
      ]} />
      <SectionCard title={t("admStudioC.drawer.content")}>{Object.keys(d.payload).length ? <PayloadView value={d.payload} /> : <Text variant="small" tone="gray">{t("admStudioC.drawer.noPayload")}</Text>}</SectionCard>
      {d.hasFile && cur ? <Button title={cur.fileName || t("admStudioC.drawer.file")} icon="paperclip" variant="line" size="sm" loading={busy === "file"} onPress={() => act("file", () => downloadVersionFile(cur.id || d.currentVersionId, cur.fileName))} /> : null}
      <SectionCard title={t("admStudioC.drawer.steps")}><StepsPane steps={d.steps} approvalFree={free} submitted={false} onReassign={a.canReassign && (d.status === "submitted" || d.status === "in_review") ? setReassign : undefined} /></SectionCard>
      <SectionCard title={t("admStudioC.drawer.comments")}><CommentsPane id={d.id} canWrite={a.any} /></SectionCard>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Button title={t(a.canEdit ? "admStudioC.drawer.openEditor" : "admStudioC.drawer.view")} icon="edit-3" variant="soft" size="sm" onPress={() => router.push({ pathname: "/manage/studio/object", params: { id: d.id } } as never)} />
        {a.isAdmin || a.canPublish ? <Button title={t("admStudioB.versions.excel")} icon="download" variant="line" size="sm" loading={busy === "xls"} onPress={() => act("xls", () => exportVersions(d.id, d.title))} /> : null}
      </View>
      <ReassignSheet step={reassign} code={d.code} onClose={() => setReassign(null)} />
    </>
  );
}
