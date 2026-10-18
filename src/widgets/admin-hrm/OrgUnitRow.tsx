import { unitTypeLabel, type OrgNode } from "@/entities/admin-hrm";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

export const LEVEL_TINT = ["#6366F1", "#3B82F6", "#06B6D4", "#22C55E"];

type Props = { node: OrgNode; open: boolean; kids: number; onToggle: () => void; onPress: () => void };

// A unit of the tree as a ticket: level colour strip, headcount badge, type / counts chips and an expand toggle.
export function OrgUnitRow({ node: n, open, kids, onToggle, onPress }: Props) {
  const { t } = useT();
  return (
    <CcTicket
      tint={LEVEL_TINT[Math.min(n.level, 3)]} icon="layers" title={n.label} subtitle={n.sub || undefined} onPress={onPress}
      badge={<Pill small tone="blue" icon="users" label={String(n.people)} />}
      chips={<>
        {n.unitType ? <Pill small tone="gray" label={unitTypeLabel(t, n.unitType)} /> : null}
        <Pill small tone="gray" icon="briefcase" label={String(n.positions)} />
      </>}
      actions={kids ? <CcAction icon={open ? "chevron-up" : "chevron-down"} label={t(open ? "admHrmU.collapse" : "admHrmU.expand")} onPress={() => { selectHaptic(); onToggle(); }} /> : undefined}
    />
  );
}
