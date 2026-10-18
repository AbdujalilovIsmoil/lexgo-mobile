import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A part of the AI-reglament API that the backend has not switched on yet: honest "not enabled" with a re-check.
export function MissingState({ text, onRecheck, busy }: { text?: string; onRecheck?: () => void; busy?: boolean }) {
  const { t } = useT();
  return <EmptyState icon="clock" title={t("admAiReg.missingTitle")} text={text ?? t("admAiReg.missingText")} actionLabel={onRecheck && !busy ? t("admAiReg.recheck") : undefined} onAction={onRecheck} />;
}
