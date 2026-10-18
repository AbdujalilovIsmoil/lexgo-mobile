import { View } from "react-native";
import { Card, Pill } from "@/shared/ui";
import { StudioFlow, StudioStatusPill, useStudioText } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";
import { TextField } from "@/features/admin-studio";

// Title, version, status, unsaved marker and the status flow of the open object.
export function ObjectHeader({ ws }: { ws: Workspace }) {
  const { t } = useStudioText();
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ws.detail?.currentVersion ? <Pill label={`v${ws.detail.currentVersion.replace(/^v/i, "")}`} tone="gray" small /> : null}
        <StudioStatusPill status={ws.status} raw={ws.detail?.statusRaw} />
        {ws.dirty && !ws.readOnly ? <Pill label={t("admStudioB.unsaved")} tone="warn" icon="edit-2" small /> : null}
        {ws.creating ? <Pill label={t("admStudioB.notSaved")} tone="gray" small /> : null}
      </View>
      <TextField label={t("admStudioB.titleLabel")} value={ws.draft?.title ?? ""} onChange={ws.setTitle} readOnly={ws.readOnly} required placeholder={t("admStudioB.titlePh")} error={ws.errors.title} />
      <StudioFlow status={ws.status} raw={ws.detail?.statusRaw} approvalFree={ws.approvalFree} />
    </Card>
  );
}
