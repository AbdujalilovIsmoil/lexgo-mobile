import { sellerTypeLabel, Stars, useReview, type Review } from "@/entities/admin-reviews";
import { FactRows, FormSheet, QueryBoundary, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";

// A review in full: the rating and comment, who wrote it, about which seller, in which case / order.
export function ReviewSheet({ item, onClose }: { item: Review | null; onClose: () => void }) {
  const { t, locale } = useT();
  const r = useKept(item);
  const q = useReview(r?.id ?? null);
  const d = q.data;
  return (
    <FormSheet visible={!!item} onClose={onClose} title={t("admRevB.detailTitle")} subtitle={r?.lawyerName} snaps={[0.7, 0.94]}>
      <QueryBoundary query={q}>
        {d ? (
          <>
            <Block title={t("admRevB.review")}>
              <FactRows rows={[
                { label: t("admRevB.rating"), value: <Stars n={d.review.rating} /> },
                { label: t("adm.status"), value: <StatusPill status={d.review.status} /> },
                { label: t("admRevB.comment"), value: d.review.comment },
                { label: t("admRevB.note"), value: d.review.note },
                { label: "ID", value: d.workId },
                { label: t("adm.created"), value: fmtDateTime(d.review.createdAt, locale) },
              ]} />
            </Block>
            {d.seller ? (
              <Block title={t("admRevB.seller")}>
                <FactRows rows={[
                  { label: t("adm.name"), value: d.seller.name },
                  { label: t("adm.phone"), value: d.seller.phone },
                  { label: t("admRevB.sellerType"), value: sellerTypeLabel(t, d.review.sellerType) },
                  { label: t("admRevB.region"), value: d.sellerRegion },
                ]} />
              </Block>
            ) : null}
            {d.client ? (
              <Block title={t("admRevB.client")}>
                <FactRows rows={[{ label: t("adm.name"), value: d.client.name }, { label: t("adm.phone"), value: d.client.phone }]} />
              </Block>
            ) : null}
            {d.caseTitle || d.orderId ? (
              <Block title={t("admRevB.context")}>
                <FactRows rows={[{ label: t("admRevB.case"), value: d.caseTitle }, { label: t("admRevB.order"), value: d.orderId }]} />
              </Block>
            ) : null}
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
