import { useState, type ReactNode } from "react";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Two-step state of an assist form: fill in → confirm (with the error of the last send).
export function useAssistStep() {
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState("");
  return { confirming, err, setErr, review: () => { setErr(""); setConfirming(true); }, back: () => setConfirming(false), reset: () => { setConfirming(false); setErr(""); } };
}

type Props = {
  visible: boolean; onClose: () => void; title: string; reviewLabel: string; confirming: boolean; busy: boolean; disabled?: boolean;
  onReview: () => void; onBack: () => void; onSubmit: () => void; form: ReactNode; confirm: ReactNode;
};

// One sheet, two bodies: the form, then the confirmation with "Back" and "Confirm and send".
export function AssistFormSheet({ visible, onClose, title, reviewLabel, confirming, busy, disabled, onReview, onBack, onSubmit, form, confirm }: Props) {
  const { t } = useT();
  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      title={title}
      onSubmit={confirming ? onSubmit : onReview}
      submitLabel={confirming ? t("admSupC.confirm.send") : reviewLabel}
      submitting={busy}
      disabled={disabled}
      secondary={confirming ? { label: t("adm.back"), onPress: onBack } : undefined}
      snaps={[0.8, 0.95]}
    >
      {confirming ? confirm : form}
    </FormSheet>
  );
}
