import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { uzs } from "@/shared/lib/json";
import { n } from "@/entities/pro-workspace";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { IconName } from "@/shared/ui";

type Def = { key: string; icon: IconName; tint: string };
const WORKLOAD: Def[] = [
  { key: "active_cases", icon: "briefcase", tint: "#3B82F6" }, { key: "courts_today", icon: "flag", tint: "#EF4444" },
  { key: "deadlines_today", icon: "clock", tint: "#F59E0B" }, { key: "unread_messages", icon: "message-circle", tint: "#8B5CF6" },
  { key: "documents_to_review", icon: "file-text", tint: "#14B8A6" },
];
const FINANCE: Def[] = [
  { key: "earnings_today", icon: "credit-card", tint: "#22C55E" }, { key: "earnings_month", icon: "trending-up", tint: "#22C55E" },
  { key: "pending_payout", icon: "clock", tint: "#F59E0B" }, { key: "earnings_via_lexgo", icon: "briefcase", tint: "#3B82F6" },
  { key: "payable", icon: "credit-card", tint: "#8B5CF6" },
];

// Workload counters (numbers) or finance sums (so'm) from the stats payload; missing keys read 0.
export function Tiles({ kind, data, loading }: { kind: "w" | "f"; data: Dict; loading: boolean }) {
  const { t } = useT();
  const defs = kind === "w" ? WORKLOAD : FINANCE;
  return (
    <SectionCard title={t(kind === "w" ? "aw9.workload" : "aw9.finance")}>
      <KpiGrid>
        {defs.map((d) => (
          <KpiTile key={d.key} loading={loading} icon={d.icon} tint={d.tint} label={t(`aw9.${kind}.${d.key}`)} value={kind === "w" ? String(n(data, d.key)) : `${fmtMoney(uzs(data, d.key))} ${t("adm.currency")}`} />
        ))}
      </KpiGrid>
    </SectionCard>
  );
}
