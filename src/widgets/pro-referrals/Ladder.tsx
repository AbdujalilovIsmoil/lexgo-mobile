import { Text } from "@/shared/ui";
import { SectionCard, ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Seller commission ladder (web rule S-28): 18% base, 16% from 5 active invitees, 15% from 10, 13% from 20.
const TIERS: [number, number][] = [[5, 16], [10, 15], [20, 13]];
const BASE = 18;

export function Ladder({ joined }: { joined: number }) {
  const { t } = useT();
  const reached = TIERS.filter(([n]) => joined >= n);
  const next = TIERS.find(([n]) => joined < n);
  const goal = next ? next[0] : TIERS[TIERS.length - 1][0];
  return (
    <SectionCard>
      <Text variant="h4">{t("aw10.tier.now", { pct: reached.length ? reached[reached.length - 1][1] : BASE })}</Text>
      <ProgressBar value={joined / goal} />
      <Text variant="small" tone="gray">{next ? t("aw10.tier.next", { n: next[0] - joined, pct: next[1] }) : t("aw10.tier.max")}</Text>
    </SectionCard>
  );
}
