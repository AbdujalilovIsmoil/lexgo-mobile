import { Text } from "@/shared/ui";
import { DonutChart, SectionCard } from "@/shared/ui/admin";
import type { CeoCtx } from "./lib/useCeoCtx";

const COLORS = ["#3B82F6", "#8B5CF6", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4", "#94A3B8"];
const MAX = 6;

// The lead share per acquisition channel (the funnel itself is FunnelSteps).
export function CeoFunnelChannels({ x }: { x: CeoCtx }) {
  const { t, label, c } = x;
  const empty = <Text variant="small" tone="gray">{t("admCeo.noData")}</Text>;
  const byLabel = new Map<string, number>(); // same-named channels share one slice
  for (const ch of c?.channels ?? []) byLabel.set(label.source(ch.name), (byLabel.get(label.source(ch.name)) ?? 0) + (ch.leads || ch.payments || ch.pct));
  const ranked = [...byLabel].map(([name, value]) => ({ label: name, value })).sort((a, b) => b.value - a.value);
  const rest = ranked.slice(MAX).reduce((s, p) => s + p.value, 0);
  const slices = [...ranked.slice(0, MAX), ...(rest > 0 ? [{ label: t("admDashB.drill.other"), value: rest }] : [])].map((p, i) => ({ ...p, color: COLORS[i % COLORS.length] }));
  return (
    <>
      <SectionCard title={t("admCeo.channels")}>{slices.length ? <DonutChart slices={slices} /> : empty}</SectionCard>
    </>
  );
}
