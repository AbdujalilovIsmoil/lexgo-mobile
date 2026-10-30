import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { FilePreview, type FileRef } from "@/shared/ui/preview";
import { useInsets } from "@/shared/lib/insets";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useDocSettings } from "@/entities/doc-settings";
import { docCan, docKeys, useDoc, useDocPolicy } from "@/entities/my-document";
import { AnswersSheet, CtorSheet, RatingSheet, ReviewSheet, useCtorPrompt, useDocRealtime } from "@/features/my-documents";
import { DocDetailBody, type SheetKey } from "@/widgets/my-documents";

// One document: status timeline, answers, file, advocate chat/call, payment and rating (TZ 15).
export default function DocumentDetailPage({ id }: { id: string }) {
  const { t } = useT();
  const insets = useInsets();
  const qc = useQueryClient();
  const router = useRouter();
  const q = useDoc(id);
  const doc = q.data;
  const policy = useDocPolicy(id, !!doc).data;
  const reviewOff = useDocSettings().gate("review").state === "off"; // the platform switched the review mode off (TZ.md §4)
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [file, setFile] = useState<FileRef | null>(null);
  const shownFile = useKept(file);
  useDocRealtime();
  const ctor = useCtorPrompt(doc);
  const can = doc ? docCan(doc, policy, reviewOff) : null;
  const close = () => setSheet(null);
  // A sheet must be gone before the full-screen preview opens over it.
  const openFile = (f: FileRef) => { const wait = sheet ? 320 : 0; close(); setTimeout(() => setFile(f), wait); };
  const refresh = () => qc.invalidateQueries({ queryKey: docKeys.all });
  return (
    <AdminPage title={t("dm3.title")} subtitle={doc?.workId}>
      {q.isLoading ? <Skeleton height={320} round={20} style={{ margin: 16 }} /> : null}
      {q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : null}
      {doc && can ? (
        <ScrollView refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void refresh()} />} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
          <DocDetailBody doc={doc} policy={policy} can={can} onSheet={setSheet} onFile={openFile} onRefresh={refresh} />
        </ScrollView>
      ) : null}
      {doc && can ? (
        <>
          <AnswersSheet doc={doc} editable={can.edit} visible={sheet === "answers"} onClose={close} />
          <ReviewSheet docId={doc.id} visible={sheet === "review"} onClose={close} />
          <RatingSheet docId={doc.id} visible={sheet === "rate"} onClose={close} />
          <CtorSheet visible={ctor.visible} title={ctor.title} message={ctor.message} onYes={() => (doc?.templateId ? router.push(`/templates/${encodeURIComponent(doc.templateId)}/fill?request=${encodeURIComponent(doc.id)}` as never) : setSheet("answers"))} onClose={ctor.close} />
        </>
      ) : null}
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={shownFile} />
    </AdminPage>
  );
}
