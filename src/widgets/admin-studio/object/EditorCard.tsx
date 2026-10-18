import { SectionCard } from "@/shared/ui/admin";
import { useStudioText } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";
import { Text } from "@/shared/ui";

// The constructor's editor (generic or special) inside a titled card.
export function EditorCard({ ws }: { ws: Workspace }) {
  const { t } = useStudioText();
  const Editor = ws.editor.Editor;
  if (!ws.draft) return null;
  const file = ws.curVer || ws.hasFile ? { hasFile: ws.hasFile, fileName: ws.curVer?.fileName ?? "", versionId: ws.curVer?.id ?? "" } : null;
  return (
    <SectionCard title={t("admStudioB.content")}>
      <Text variant="caption" tone="gray">{t(ws.readOnly ? "admStudioB.readOnly" : "admStudioB.contentHint")}</Text>
      <Editor
        code={ws.code}
        ctor={ws.ctor}
        payload={ws.draft.payload}
        onChange={ws.setPayload}
        errors={ws.errors}
        readOnly={ws.readOnly}
        file={file}
        onUploadFile={!ws.readOnly && ws.id ? async (f) => void (await ws.upload(f)) : null}
      />
    </SectionCard>
  );
}
