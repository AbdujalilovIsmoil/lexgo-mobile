import { useT } from "@/shared/i18n";
import { AssistFormSheet } from "./AssistFormSheet";
import { ConfirmBody } from "./ConfirmBody";
import type { FlowProps } from "./flowTypes";
import { PlanForm } from "./PlanForm";
import { usePlanFlow } from "./usePlanFlow";

// Sell a subscription on the client's behalf (price quote, then a payment request approved in Telegram).
export function PlanSheet(props: FlowProps) {
  const { t } = useT();
  const f = usePlanFlow(props);
  const { step } = f;
  return (
    <AssistFormSheet
      visible={props.visible}
      onClose={f.close}
      title={step.confirming ? t("admSupC.plan.confirmTitle") : t("admSupC.plan.heading")}
      reviewLabel={t("admSupC.plan.next")}
      confirming={step.confirming}
      busy={f.busy}
      disabled={!f.fresh}
      onReview={step.review}
      onBack={step.back}
      onSubmit={f.submit}
      form={<PlanForm f={f} />}
      confirm={<ConfirmBody rows={f.rows} note={t("admSupC.plan.confirmNote")} error={step.err} />}
    />
  );
}
