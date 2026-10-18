import { ScrollView } from "react-native";
import { Button, Text } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import type { DocReq } from "@/entities/doc-queue";
import { SourceList, useSourceFlow } from "@/features/doc-editor";

// Before the editor opens: what should it start from (clean template, blank, AI draft, client file, own .docx).
export function SourceStage({ doc, onStart }: { doc: DocReq; onStart: () => void }) {
  const { t } = useT();
  const insets = useInsets();
  const flow = useSourceFlow(doc.id, () => {});
  return (
    <AdminPage title={t("ad4.startTitle")} subtitle={doc.title} footer={<Button title={t("ad4.openEditor")} icon="edit-3" variant="gradient" full onPress={onStart} />}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}>
        <Text variant="small" tone="gray">{t("ad4.startLead")}</Text>
        <SourceList flow={flow} onPick={(o) => flow.select.mutate(o)} onUpload={() => flow.upload.mutate()} />
      </ScrollView>
    </AdminPage>
  );
}
