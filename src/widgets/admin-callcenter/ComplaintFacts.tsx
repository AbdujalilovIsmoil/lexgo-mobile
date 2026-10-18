import { useState } from "react";
import { useCcLabel, type ComplaintDetail } from "@/entities/admin-callcenter";
import { Button, Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { FactRows, SectionCard, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Everything the operator reads before ruling: complaint text, rating, client, advocate, the work behind it
// (delivered document with an in-app viewer, or the urgent request) and the rulings already made.
export function ComplaintFacts({ d }: { d: ComplaintDetail }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const [viewer, setViewer] = useState(false);
  return (
    <>
      <FactRows rows={[
        { label: t("admCcB.fRating"), value: d.rating ? `${d.rating} ★` : "" }, { label: t("admCcB.fClient"), value: [d.clientName, d.clientPhone].filter(Boolean).join(" · ") },
        { label: t("admCcB.fLawyer"), value: d.row.lawyerName }, { label: t("adm.created"), value: fmtDateTime(d.row.createdAt, locale) },
        { label: t("admCcB.fSettled"), value: d.resolvedAction ? label("admCcB.cStatus", d.resolvedAction) : "" },
      ]} />
      {d.complaint ? <SectionCard title={t("admCcB.bComplaint")}><Text variant="body">{d.complaint}</Text></SectionCard> : null}
      {d.operatorNote ? <SectionCard title={t("admCcB.bOperator")}><Text variant="body">{d.operatorNote}</Text></SectionCard> : null}
      {d.docTitle || d.docFile ? (
        <SectionCard title={t("admCcB.bDocument")}>
          {d.docTitle ? <Text variant="body" weight="semibold">{d.docTitle}</Text> : null}
          {d.docWorkId || d.docStatus ? <Text variant="caption" tone="gray2">{d.docWorkId}</Text> : null}
          {d.docStatus ? <StatusPill status={d.docStatus} /> : null}
          {d.docFile ? <Button title={t("admCcB.openFile")} icon="file-text" size="sm" variant="soft" onPress={() => setViewer(true)} /> : <Text variant="small" tone="gray">{t("cc4.noFile")}</Text>}
          <FilePreview visible={viewer} onClose={() => setViewer(false)} file={d.docFile} />
        </SectionCard>
      ) : null}
      {d.urgentTitle || d.urgentNeed ? (
        <SectionCard title={t("admCcB.bUrgent")}>
          {d.urgentTitle ? <Text variant="body" weight="semibold">{label("admCc.kind", d.urgentTitle)}</Text> : null}
          {d.urgentNeed ? <Text variant="small" tone="gray">{d.urgentNeed}</Text> : null}
          <Text variant="caption" tone="gray2">{[d.urgentWorkId, d.urgentStatus ? label("admCc.stat", d.urgentStatus) : ""].filter(Boolean).join(" · ")}</Text>
        </SectionCard>
      ) : null}
    </>
  );
}
