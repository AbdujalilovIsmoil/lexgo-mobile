import type { ReactNode } from "react";
import { Notice } from "@/shared/ui/sel";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; title: string; restored: boolean; discard: () => void; onSubmit: () => void; submitting: boolean; disabled?: boolean; children: ReactNode };

// Frame of every profile form: sticky Save, a "draft restored" note with a discard action.
export function SectionSheet({ visible, onClose, title, restored, discard, onSubmit, submitting, disabled, children }: Props) {
  const { t } = useT();
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} onSubmit={onSubmit} submitting={submitting} disabled={disabled} secondary={restored ? { label: t("sl4.discard"), onPress: discard } : undefined} snaps={[0.7, 0.94]}>
      {restored ? <Notice text={t("sl4.draftRestored")} /> : null}
      {children}
    </FormSheet>
  );
}
