import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput, useAppForm } from "@/shared/form";
import { EmptyState, Skeleton, Text, toast } from "@/shared/ui";
import { FormSheet, RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { addCaseDoc, caseKeys, useCaseDocs, type ClientCase } from "@/entities/client-case";
import { docSchema } from "./docSchema";
import { useCaseText } from "./useCaseText";

// Documents attached to a case (GET/POST /case-documents, filtered by payload.case_id).
export function DocsSheet({ target, onClose }: { target: ClientCase | null; onClose: () => void }) {
  const { t } = useT();
  const text = useCaseText();
  const qc = useQueryClient();
  const id = target?.id ?? "";
  const docs = useCaseDocs(id);
  const f = useAppForm(docSchema, { title: "" });
  const [busy, setBusy] = useState(false);
  const add = f.handleSubmit(async ({ title }) => {
    if (busy || !id) return;
    setBusy(true);
    try {
      await addCaseDoc(id, title);
      f.reset({ title: "" });
      toast(t("ccs.docsAdded"), "ok");
      void qc.invalidateQueries({ queryKey: caseKeys.docs(id) });
    } catch { toast(t("ccs.requestError"), "err"); } finally { setBusy(false); }
  });
  const rows = docs.data ?? [];
  return (
    <FormSheet visible={!!target} onClose={onClose} title={t("ccs.docsTitle")} onSubmit={() => void add()} submitLabel={busy ? t("ccs.requestSending") : t("ccs.docsAdd")} submitting={busy}>
      {docs.isLoading ? <Skeleton height={56} round={14} /> : !rows.length ? <EmptyState icon="file-text" title={t("ccs.docsEmpty")} text={t("ccs.docsEmptyText")} /> : rows.map((d) => <RowCard key={d.id} title={d.title} subtitle={d.status ? text.status(d.status) : undefined} />)}
      <Text variant="small" tone="gray">{t("ccs.docsAdd")}</Text>
      <FormInput control={f.control} name="title" placeholder={t("ccs.docsAddPh")} maxLength={200} />
    </FormSheet>
  );
}
