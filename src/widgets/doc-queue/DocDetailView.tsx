import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { useInsets } from "@/shared/lib/insets";
import { useDoc, useDocSync, type DocFile } from "@/entities/doc-queue";
import { DocFiles } from "./DocFiles";
import { DocFooter } from "./DocFooter";
import { DocHead } from "./DocHead";
import { DocNeed } from "./DocNeed";
import { DocRating } from "./DocRating";
import { DocBlock } from "./DocBlock";

// One request: facts, the client's need and answers, files (with in-app preview), rating, and the next step.
export function DocDetailView({ id }: { id: string }) {
  const { t } = useT();
  const insets = useInsets();
  const q = useDoc(id);
  useDocSync();
  const [file, setFile] = useState<DocFile | null>(null);
  const shown = useKept(file);
  const doc = q.data;
  return (
    <AdminPage title={t("ad1.detail")} subtitle={doc?.clientName} footer={doc ? <DocFooter doc={doc} onView={setFile} /> : undefined}>
      <QueryBoundary query={q}>
        {doc ? (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}>
            <DocHead doc={doc} />
            <DocBlock doc={doc} />
            <DocNeed doc={doc} />
            <DocFiles doc={doc} onOpen={setFile} />
            <DocRating doc={doc} />
            <View><Text variant="caption" tone="gray2" center>{t("ad1.hint")}</Text></View>
          </ScrollView>
        ) : null}
      </QueryBoundary>
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={shown && { path: shown.path, name: shown.name, mime: shown.mime }} />
    </AdminPage>
  );
}
