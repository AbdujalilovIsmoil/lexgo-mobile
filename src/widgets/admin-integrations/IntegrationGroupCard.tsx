import { IntegrationTile, type IntegrationGroup } from "@/entities/admin-integrations";
import { SectionCard } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// One category of integrations (payments, notifications …) as a titled card of status rows.
export function IntegrationGroupCard({ group }: { group: IntegrationGroup }) {
  const { t } = useT();
  const key = `admInt.cat.${group.category}`;
  return (
    <SectionCard title={group.category ? (t(key) !== key ? t(key) : humanizeSlug(group.category)) : t("admInt.cat.other")}>
      {group.items.map((i, n) => <IntegrationTile key={i.key || n} item={i} last={n === group.items.length - 1} />)}
    </SectionCard>
  );
}
