import { Skeleton, Icon, Text } from "@/shared/ui";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import type { PromoPackage } from "@/entities/promotion";
import { useColors } from "@/shared/theme";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { packages: PromoPackage[] | undefined; loading: boolean; value: string; onChange: (id: string) => void };

// Step 3 — the admin-priced packages for this placement: days, price, boost strength, where it shows.
export function PackageStep({ packages, loading, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  return (
    <SectionCard title={t("sl11.step.package")}>
      {loading ? <Skeleton height={72} round={16} /> : null}
      {!loading && !packages?.length ? <Text variant="small" tone="gray">{t("sl11.noPackages")}</Text> : null}
      {(packages ?? []).map((p) => (
        <RowCard
          key={p.id}
          icon="zap"
          title={p.title}
          subtitle={`${t("sl11.days", { n: p.days })} · ${som(p.price)}`}
          meta={[p.surfaceLabel, p.boostScore ? t("sl11.power", { n: p.boostScore }) : ""].filter(Boolean).join(" · ")}
          onPress={() => onChange(p.id)}
          right={<Icon name={value === p.id ? "check-circle" : "circle"} size={22} color={value === p.id ? c.accent : c.gray2} />}
        />
      ))}
    </SectionCard>
  );
}
