import { useT } from "@/shared/i18n";
import { AssistFormSheet } from "./AssistFormSheet";
import { ConfirmBody } from "./ConfirmBody";
import type { FlowProps } from "./flowTypes";
import { MarketForm } from "./MarketForm";
import { useMarketFlow } from "./useMarketFlow";

// Marketplace service for the client: a purchase request that waits for Telegram approval.
export function MarketSheet(props: FlowProps) {
  const { t } = useT();
  const f = useMarketFlow(props);
  const { step } = f;
  return (
    <AssistFormSheet
      visible={props.visible}
      onClose={f.close}
      title={step.confirming ? t("admSupC.market.confirmTitle") : t("admSupC.market.heading")}
      reviewLabel={t("admSupC.market.next")}
      confirming={step.confirming}
      busy={f.busy}
      disabled={f.target && !f.quote.settled}
      onReview={f.review}
      onBack={step.back}
      onSubmit={f.submit}
      form={<MarketForm f={f} />}
      confirm={<ConfirmBody rows={f.rows} note={t("admSupC.market.confirmNote")} error={step.err} />}
    />
  );
}
