import { useMemo } from "react";
import { useBoard, useEmployees, usePositions } from "./peopleQueries";

// id → display name lookups for the ids the API returns (employee, user, unit, position). Unknown ids give "".
export function useNames() {
  const emps = useEmployees().data;
  const positions = usePositions().data;
  const nodes = useBoard().data?.nodes;
  return useMemo(() => {
    const e = new Map((emps ?? []).map((x) => [x.id, x.name]));
    const u = new Map((emps ?? []).filter((x) => x.userId).map((x) => [x.userId, x.name]));
    const p = new Map((positions ?? []).map((x) => [x.id, x.title]));
    const unit = new Map((nodes ?? []).filter((x) => x.kind === "unit").map((x) => [x.entityId, x.label]));
    return {
      employee: (id: string) => e.get(id) ?? "",
      user: (id: string) => u.get(id) ?? "",
      position: (id: string) => p.get(id) ?? "",
      unit: (id: string) => unit.get(id) ?? "",
    };
  }, [emps, positions, nodes]);
}
export type Names = ReturnType<typeof useNames>;
