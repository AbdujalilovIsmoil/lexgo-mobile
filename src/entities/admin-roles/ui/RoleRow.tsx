import { memo } from "react";
import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Role } from "../model/types";

type Props = { role: Role; titles: Map<string, string>; total: number; onOpen: (r: Role) => void; onAssign: (r: Role) => void };

// One role as a ticket: strip by how much power it grants, permission-count badge, first permissions as chips, assign + open buttons.
export const RoleRow = memo(function RoleRow({ role, titles, total, onOpen, onAssign }: Props) {
  const { t } = useT();
  const c = useColors();
  const n = role.permissions.length;
  const tint = !n ? c.gray2 : total && n / total >= 0.6 ? c.err : c.accent;
  return (
    <CcTicket
      tint={tint} icon="shield" title={role.title || role.name} subtitle={role.name} onPress={() => onOpen(role)}
      badge={<Pill small tone={!n ? "gray" : tint === c.err ? "err" : "blue"} label={t("admRoles.permCount", { n })} />}
      chips={<>
        {role.permissions.slice(0, 3).map((p) => <Pill key={p} small tone="gray" label={titles.get(p) ?? p} />)}
        {n > 3 ? <Pill small tone="gray" label={`+${n - 3}`} /> : null}
      </>}
      actions={<><CcAction icon="user-check" label={t("admRoles.assign")} onPress={() => onAssign(role)} /><CcAction primary icon="chevron-right" label={t("admRolesB.open")} onPress={() => onOpen(role)} /></>}
    />
  );
});
