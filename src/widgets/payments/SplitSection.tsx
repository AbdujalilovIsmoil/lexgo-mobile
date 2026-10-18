import { fmtUzs, usePaymentSplit } from "@/entities/payment";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Where the money went (GET /payments/{id}/split). Providers without a split answer 400/503;
// then there is simply nothing to show.
export function SplitSection({ id, enabled }: { id: string; enabled: boolean }) {
  const { t } = useT();
  const q = usePaymentSplit(id, enabled);
  const d = q.data;
  if (!d || !d.gross) return null;
  return (
    <SectionCard title={t("py2.split.title")}>
      <FactRows rows={[
        { label: t("py2.split.gross"), value: fmtUzs(d.gross, t) },
        { label: t("py2.split.platform"), value: fmtUzs(d.platformFee, t) },
        { label: t("py2.split.provider"), value: fmtUzs(d.providerFee, t) },
        { label: t("py2.split.seller"), value: fmtUzs(d.sellerShare, t) },
      ]} />
    </SectionCard>
  );
}
