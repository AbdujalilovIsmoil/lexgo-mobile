import { View } from "react-native";
import { Button, IconButton } from "@/shared/ui";
import { useStudioText } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";

type Props = { ws: Workspace; onSave: () => void; onMeta: () => void; onSubmit: () => void; onPublish: () => void };

// Sticky actions of the editor: save (+ save with a note), submit (or submit & publish), publish.
export function ObjectFooter({ ws, onSave, onMeta, onSubmit, onPublish }: Props) {
  const { t } = useStudioText();
  const canSave = ws.access.canEdit && !ws.readOnly && !!ws.draft;
  const submitShown = canSave && (ws.creating || ws.status === "draft" || ws.status === "changes_requested" || ws.dirty);
  const publishShown = !ws.creating && ws.status === "approved" && ws.access.canPublish && !ws.approvalFree;
  const busy = ws.busy !== "";
  if (!canSave && !publishShown) return null;
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {canSave && !ws.creating ? <IconButton icon="edit-2" onPress={onMeta} label={t("admStudioB.save.more")} /> : null}
      {canSave ? <Button title={t(ws.creating ? "admStudioB.save.create" : "adm.save")} variant={submitShown || publishShown ? "line" : "primary"} loading={ws.busy === "save"} disabled={busy || (!ws.dirty && !ws.creating)} onPress={onSave} style={{ flex: 1 }} /> : null}
      {submitShown ? <Button title={t(ws.approvalFree ? "admStudioB.submit.free" : ws.dirty || ws.creating ? "admStudioB.submit.saveAnd" : "admStudioB.submit.send")} variant="gradient" icon={ws.approvalFree ? "upload-cloud" : "send"} loading={ws.busy === "submit"} disabled={busy} onPress={onSubmit} style={{ flex: 1.3 }} /> : null}
      {publishShown ? <Button title={t("admStudio.actions.publish")} variant="gradient" icon="upload-cloud" disabled={busy || ws.dirty} onPress={onPublish} style={{ flex: 1.3 }} /> : null}
    </View>
  );
}
