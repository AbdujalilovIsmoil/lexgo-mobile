import { HrmStatus, unitTypeLabel, useNames, useUnit, type OrgNode, type Unit } from "@/entities/admin-hrm";
import { FactRows, FormSheet, QueryBoundary, RowCard } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

type Props = { node: OrgNode | null; canManage: boolean; onClose: () => void; onEdit: (u: Unit) => void; onAddChild: (parentId: string) => void };

// One unit: facts and its people; org managers can edit it or add a sub-unit.
export function UnitSheet({ node: current, canManage, onClose, onEdit, onAddChild }: Props) {
  const { t } = useT();
  const node = useKept(current);
  const q = useUnit(current?.entityId ?? "");
  const names = useNames();
  const u = q.data;
  return (
    <FormSheet
      visible={!!current} onClose={onClose} title={node?.label ?? ""} subtitle={node?.sub}
      onSubmit={canManage && u ? () => onEdit(u) : undefined} submitLabel={t("admHrmB.editUnit")} secondary={canManage && node ? { label: t("admHrmB.addSub"), onPress: () => onAddChild(node.entityId) } : undefined}
    >
      <QueryBoundary query={q}>
        {u && node ? (
          <>
            <FactRows rows={[
              { label: t("adm.status"), value: <HrmStatus status={u.status} /> }, { label: t("admHrmB.unitKind"), value: unitTypeLabel(t, u.type) },
              { label: t("admHrmB.parent"), value: names.unit(u.parentId) }, { label: t("admHrmB.head"), value: names.employee(u.headId) },
              { label: t("admHrmB.people"), value: String(node.people) }, { label: t("admHrmB.positions"), value: String(node.positions) }, { label: t("admHrmB.subUnits"), value: String(node.children) },
            ]} />
            {u.people.map((p) => <RowCard key={p.id} avatar={p.name} title={p.name} subtitle={p.assignment ? names.position(p.assignment.positionId) : ""} meta={p.code} />)}
          </>
        ) : <></>}
      </QueryBoundary>
    </FormSheet>
  );
}
