import { SelectField } from "@/shared/ui/admin";
import { useBoard, useEmployees, usePositions } from "../model/peopleQueries";

type Props = { label: string; value: string; onChange: (v: string) => void; none?: string };
const withNone = (none: string | undefined, rest: { value: string; label: string; hint?: string }[]) => (none ? [{ value: "", label: none }, ...rest] : rest);

// Pickers for the ids the HRM API works with. `none` adds an empty choice ("All", "Not set").
export function EmployeeSelect({ label, value, onChange, none }: Props) {
  const list = useEmployees().data ?? [];
  return <SelectField label={label} value={value} onChange={onChange} searchable options={withNone(none, list.map((e) => ({ value: e.id, label: e.name, hint: e.code })))} />;
}

export function UnitSelect({ label, value, onChange, none, skip }: Props & { skip?: string }) {
  const nodes = (useBoard().data?.nodes ?? []).filter((n) => n.kind === "unit" && n.entityId !== skip);
  return <SelectField label={label} value={value} onChange={onChange} searchable options={withNone(none, nodes.map((n) => ({ value: n.entityId, label: `${"· ".repeat(n.level)}${n.label}`, hint: n.sub })))} />;
}

export function PositionSelect({ label, value, onChange, none }: Props) {
  const list = usePositions().data ?? [];
  return <SelectField label={label} value={value} onChange={onChange} searchable options={withNone(none, list.map((p) => ({ value: p.id, label: p.title, hint: p.code })))} />;
}
