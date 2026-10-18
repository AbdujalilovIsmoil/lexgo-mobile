import { aidMapped, aidStatus, useAidDetail, type AidRequest } from "@/entities/admin-aid";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";

// Detail of a request: what the citizen wrote (from the list row at once), then where it came from and the explanation.
export function AidSheet({ item, onClose }: { item: AidRequest | null; onClose: () => void }) {
  const { t, locale } = useT();
  const r = useKept(item);
  const q = useAidDetail(r?.id ?? null);
  const d = q.data;
  const req = d?.request ?? r;
  const phone = req?.phone ?? "";
  return (
    <FormSheet visible={!!item} onClose={onClose} title={r?.name || t("admAid.anon")} subtitle={t("admAid.detailTitle")} onSubmit={phone ? () => openTel(phone) : undefined} submitLabel={`${t("adm.call")} ${phone}`}>
      {req ? (
        <Block title={t("admAid.request")}>
          <FactRows rows={[
            { label: t("adm.name"), value: req.name },
            { label: t("adm.phone"), value: req.phone },
            { label: t("admAid.details"), value: req.details },
            { label: t("adm.status"), value: <StatusPill status={req.status || "new"} label={aidStatus(t, req.status)} /> },
            { label: "ID", value: req.workId },
            { label: t("adm.created"), value: fmtDateTime(req.createdAt, locale) },
          ]} />
        </Block>
      ) : null}
      {q.isLoading ? <Skeleton height={96} round={20} /> : null}
      {q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : null}
      {d ? (
        <>
          <Block title={t("admAid.origin")}>
            <FactRows rows={[
              { label: t("admAid.source"), value: aidMapped(t, "sourceMap", d.source) },
              { label: t("admAid.event"), value: aidMapped(t, "eventMap", d.event) },
              { label: t("admAid.createdBy"), value: d.createdByName || d.createdByUserId },
            ]} />
          </Block>
          {d.explanation ? <Block title={t("admAid.explanation")}><Text variant="small">{d.explanation}</Text></Block> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
