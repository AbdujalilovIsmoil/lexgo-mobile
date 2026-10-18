import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { Can } from "@/entities/access";
import type { AtRiskClient } from "@/entities/admin-dash";
import { fmtDate } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import type { RetCtx } from "../useRetentionCtx";

type Props = { x: RetCtx; client: AtRiskClient; done: boolean; busy: boolean; onWinBack: () => void };

// One at-risk client: red strip when they never paid, the reasons as chips, call and "win back" as round buttons.
export function RiskTicket({ x, client: c, done, busy, onWinBack }: Props) {
  const { t, label, locale } = x;
  const never = !c.lastPaidAt;
  return (
    <CcTicket
      tint={done ? "#22C55E" : never ? "#EF4444" : "#F59E0B"} avatar={c.name || c.phone} title={c.name || c.phone}
      subtitle={c.lastPaidAt ? t("admRet.lastPaid", { date: fmtDate(c.lastPaidAt, locale) }) : t("admRet.neverPaid")}
      badge={done ? <Pill small tone="ok" icon="check" label={t("admRetV.queued")} /> : undefined}
      chips={<>{c.reasons.map((r) => <Pill key={r} small tone="warn" label={label.reason(r)} />)}</>}
      actions={<>
        {c.phone ? <CcAction icon="phone" label={t("adm.call")} onPress={() => openTel(c.phone)} /> : null}
        <Can perm="leads.manage"><CcAction primary icon={done ? "check" : "rotate-ccw"} label={t("admRet.winBack")} loading={busy} onPress={onWinBack} /></Can>
      </>}
    />
  );
}
