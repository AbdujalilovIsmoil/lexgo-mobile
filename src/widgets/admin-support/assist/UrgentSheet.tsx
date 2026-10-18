import { useT } from "@/shared/i18n";
import { AssistFormSheet } from "./AssistFormSheet";
import { ConfirmBody } from "./ConfirmBody";
import type { FlowProps } from "./flowTypes";
import { UrgentForm } from "./UrgentForm";
import { useUrgentFlow } from "./useUrgentFlow";

// Urgent lawyer on the client's behalf: lands in the duty queue, the client is notified at once.
export function UrgentSheet(props: FlowProps) {
  const { t } = useT();
  const f = useUrgentFlow(props);
  const { step } = f;
  return (
    <AssistFormSheet
      visible={props.visible}
      onClose={f.close}
      title={step.confirming ? t("admSupC.urgent.confirmTitle") : t("admSupC.urgent.heading")}
      reviewLabel={t("admSupC.urgent.next")}
      confirming={step.confirming}
      busy={f.busy}
      onReview={f.review}
      onBack={step.back}
      onSubmit={f.submit}
      form={<UrgentForm f={f} />}
      confirm={<ConfirmBody rows={f.rows} note={t("admSupC.urgent.confirmNote", { name: f.clientName })} error={step.err} />}
    />
  );
}
