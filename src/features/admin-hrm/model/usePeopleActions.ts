import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import {
  assignEmployee, createEmployee, createPosition, createUnit, hrmKeys, updateEmployee, updatePosition, updateUnit,
  type AssignInput, type Employee, type EmployeeInput, type Position, type PositionInput, type Unit, type UnitInput,
} from "@/entities/admin-hrm";

const refresh = [hrmKeys.all];

// Create (and optionally place into a unit / position) or update an employee.
export const useSaveEmployee = () =>
  useAdminMutation({
    invalidate: refresh, success: "adm.saved",
    mutationFn: async (v: { base: Employee | null; input: EmployeeInput; assign?: AssignInput }) => {
      if (v.base) return updateEmployee(v.base, v.input);
      const created = await createEmployee(v.input);
      if (v.assign && (v.assign.unitId || v.assign.positionId)) await assignEmployee(created.id, v.assign);
      return created;
    },
  });

export const useAssignEmployee = () =>
  useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (v: { employee: Employee; input: AssignInput }) => assignEmployee(v.employee.id, v.input, v.employee) });

export const useSaveUnit = () =>
  useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (v: { base: Unit | null; input: UnitInput }) => (v.base ? updateUnit(v.base, v.input) : createUnit(v.input)) });

export const useSavePosition = () =>
  useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (v: { base: Position | null; input: PositionInput }) => (v.base ? updatePosition(v.base, v.input) : createPosition(v.input)) });
