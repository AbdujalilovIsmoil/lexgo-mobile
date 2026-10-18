import type { Deadlines } from "@/entities/pro-availability";
import { Stepper } from "@/shared/ui/sel";
import { SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Minutes the seller has to answer a new order (regular · automatic assignment · SOS), counted in working time.
export function DeadlinesCard({ value, onChange }: { value: Deadlines; onChange: (k: keyof Deadlines, n: number) => void }) {
  const { t } = useT();
  return (
    <SectionCard title={t("sl8.deadlines")}>
      {(["manual", "auto", "sos"] as const).map((k) => (
        <Stepper key={k} label={t(`sl8.dl.${k}`)} value={value[k]} min={1} max={1440} step={k === "sos" ? 1 : 5} suffix={t("common.minutesShort")} onChange={(n) => onChange(k, n)} />
      ))}
      <Text variant="caption" tone="gray2">{t("sl8.deadlinesHint")}</Text>
    </SectionCard>
  );
}
