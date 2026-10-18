import { Pill, PressableScale, Icon } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { stageColor, stageLabel, stageTone, type B2bClient, type DocKind } from "@/entities/admin-b2b";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { client: B2bClient; onStage: () => void; onDoc: (kind: DocKind) => void; onTimeline: () => void };

// A corporate client as a ticket: stage colour strip, deal value, the stage as a tappable chip and one round button per
// document (invoice is the primary one) plus the history.
export function B2bTicket({ client: c, onStage, onDoc, onTimeline }: Props) {
  const { t } = useT();
  return (
    <CcTicket
      tint={stageColor(c.stage)} avatar={c.name || "—"} title={c.name || "—"} subtitle={[c.industry, c.contact].filter(Boolean).join(" · ") || undefined}
      badge={c.value ? <Pill small tone="gray" label={`${fmtMoney(c.value)} ${t("adm.currency")}`} /> : undefined}
      chips={<PressableScale onPress={onStage} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 2 }} accessibilityRole="button"><Pill small label={stageLabel(t, c.stage)} tone={stageTone(c.stage)} /><Icon name="chevron-down" size={14} tone="gray" /></PressableScale>}
      actions={<>
        <CcAction icon="clock" label={t("admB2bB.timeline")} onPress={onTimeline} />
        <CcAction icon="bar-chart-2" label={t("admB2b.report")} onPress={() => onDoc("report")} />
        <CcAction icon="file-text" label={t("admB2b.contract")} onPress={() => onDoc("contract")} />
        <CcAction primary icon="credit-card" label={t("admB2b.invoice")} onPress={() => onDoc("invoice")} />
      </>}
    />
  );
}
