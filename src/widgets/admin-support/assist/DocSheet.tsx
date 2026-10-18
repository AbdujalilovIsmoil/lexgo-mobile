import { useT } from "@/shared/i18n";
import { AssistFormSheet } from "./AssistFormSheet";
import { ConfirmBody } from "./ConfirmBody";
import { DocForm } from "./DocForm";
import type { FlowProps } from "./flowTypes";
import { useDocFlow } from "./useDocFlow";

// Document request on the client's behalf: lands in the duty lawyers' queue.
export function DocSheet(props: FlowProps) {
  const { t } = useT();
  const f = useDocFlow(props);
  const { step } = f;
  return (
    <AssistFormSheet
      visible={props.visible}
      onClose={f.close}
      title={step.confirming ? t("admSupC.doc.confirmTitle") : t("admSupC.doc.heading")}
      reviewLabel={t("admSupC.doc.next")}
      confirming={step.confirming}
      busy={f.busy}
      onReview={f.review}
      onBack={step.back}
      onSubmit={f.submit}
      form={<DocForm f={f} />}
      confirm={<ConfirmBody rows={f.rows} note={f.note} error={step.err} />}
    />
  );
}
