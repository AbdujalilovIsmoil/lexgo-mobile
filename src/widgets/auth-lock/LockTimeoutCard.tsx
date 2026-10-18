import { LOCK_TIMEOUTS } from "@/entities/session";
import { Text } from "@/shared/ui";
import { SectionCard, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { value: number; onChange: (m: number) => void };

// How long the app may stay in the background before the lock returns.
export function LockTimeoutCard({ value, onChange }: Props) {
  const { t } = useT();
  return (
    <SectionCard title={t("au5.afterTitle")}>
      <SelectField value={String(value)} options={LOCK_TIMEOUTS.map((m) => ({ value: String(m), label: t(`au5.after.${m}`) }))} onChange={(v) => void onChange(Number(v))} />
      <Text variant="caption" tone="gray2">{t("au5.note")}</Text>
    </SectionCard>
  );
}
