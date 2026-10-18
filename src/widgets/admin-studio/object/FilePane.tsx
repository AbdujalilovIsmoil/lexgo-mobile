import { View } from "react-native";
import { Text } from "@/shared/ui";
import { useStudioText } from "@/entities/admin-studio";
import { FileBox, type Workspace } from "@/features/admin-studio";

// The file attached to the current version (K06 upload mode needs one before submitting).
export function FilePane({ ws }: { ws: Workspace }) {
  const { t } = useStudioText();
  const canUpload = ws.access.canEdit && !ws.readOnly;
  const file = { hasFile: ws.hasFile, fileName: ws.curVer?.fileName ?? "", versionId: ws.curVer?.id ?? "" };
  return (
    <View style={{ gap: 10 }}>
      {ws.uploadMode ? <Text variant="small" tone={ws.hasFile ? "ok" : "warn"}>{t(ws.hasFile ? "admStudioB.file.requiredOk" : "admStudioB.file.required")}</Text> : null}
      <FileBox file={ws.hasFile ? file : null} onUpload={canUpload ? async (f) => void (await ws.upload(f)) : null} readOnly={!canUpload} error={ws.errors.file} />
      {ws.hasFile && canUpload ? <Text variant="caption" tone="gray">{t("admStudioB.file.versionHint")}</Text> : null}
    </View>
  );
}
