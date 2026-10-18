import { fmtCount, val } from "@/entities/pro-stats";
import type { Stats } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { IconName } from "@/shared/ui";
import { Card } from "@/shared/ui";
import { Block } from "./Block";
import { StatRow, StatRowSkeleton, type TileTone } from "./StatRow";

type Def = { key: string; icon: IconName; tone: TileTone };
const WORKLOAD: Def[] = [
  { key: "active_cases", icon: "briefcase", tone: "blue" }, { key: "courts_today", icon: "flag", tone: "err" },
  { key: "deadlines_today", icon: "clock", tone: "warn" }, { key: "unread_messages", icon: "message-circle", tone: "cy" },
  { key: "documents_to_review", icon: "file-text", tone: "ok" },
];
// Today / month earnings live in the hero; these are the rest of the money picture.
const FINANCE: Def[] = [
  { key: "pending_payout", icon: "clock", tone: "warn" }, { key: "earnings_via_lexgo", icon: "briefcase", tone: "blue" },
  { key: "payable", icon: "credit-card", tone: "cy" },
];

export function Tiles({ kind, stats, loading }: { kind: "w" | "f"; stats?: Stats; loading: boolean }) {
  const { t } = useT();
  const defs = kind === "w" ? WORKLOAD : FINANCE;
  const data = (kind === "w" ? stats?.workload : stats?.finance) ?? {};
  return (
    <Block title={t(kind === "w" ? "aw9.workload" : "aw9.finance")}>
      <Card padded={false} style={{ overflow: "hidden" }}>
        {defs.map((d, i) => {
          const last = i === defs.length - 1;
          if (loading) return <StatRowSkeleton key={d.key} last={last} />;
          const v = val(data, d.key);
          return <StatRow key={d.key} icon={d.icon} tone={d.tone} last={last} label={t(`aw9.${kind}.${d.key}`)} value={kind === "w" ? fmtCount(v) : v == null ? "—" : fmtMoney(v)} unit={kind === "f" ? t("adm.currency") : undefined} />;
        })}
      </Card>
    </Block>
  );
}
