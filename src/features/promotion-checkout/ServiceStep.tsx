import type { ProService } from "@/entities/pro-service";
import { Icon, Text } from "@/shared/ui";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { services: ProService[]; value: string; onChange: (id: string) => void };

// Step 2 (service boost) — which of the seller's active services to push.
export function ServiceStep({ services, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const rows = services.filter((s) => s.status === "active" && s.catalogActive);
  return (
    <SectionCard title={t("sl11.step.service")}>
      {!rows.length ? <Text variant="small" tone="gray">{t("sl11.noServices")}</Text> : null}
      {rows.map((s) => (
        <RowCard key={s.id} icon="briefcase" title={s.name} subtitle={s.effectivePrice ? som(s.effectivePrice) : undefined} onPress={() => onChange(s.id)} right={<Icon name={value === s.id ? "check-circle" : "circle"} size={22} color={value === s.id ? c.accent : c.gray2} />} />
      ))}
    </SectionCard>
  );
}
