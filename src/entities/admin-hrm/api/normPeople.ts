import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { Assignment, Employee, Position, Unit } from "../model/types";

export function normAssignment(v: unknown): Assignment | null {
  const d = asDict(v);
  if (!asStr(d.id) && !asStr(d.employee_id)) return null;
  return {
    id: asStr(d.id), unitId: asStr(d.org_unit_id), positionId: asStr(d.position_id), managerId: asStr(d.manager_employee_id),
    employmentType: asStr(d.employment_type, "full_time"), rate: asNum(d.rate, 100), salary: asNum(d.salary_amount),
    currency: asStr(d.currency, "UZS"), status: asStr(d.status, "active"),
  };
}

export function normEmployee(v: unknown): Employee {
  const d = asDict(v);
  const first = asStr(d.first_name);
  const last = asStr(d.last_name);
  return {
    id: asStr(d.id), userId: asStr(d.user_id), code: asStr(d.employee_code),
    name: asStr(d.display_name) || `${first} ${last}`.trim() || asStr(d.employee_code),
    firstName: first, lastName: last, middleName: asStr(d.middle_name), phone: asStr(d.phone), email: asStr(d.email),
    region: asStr(d.region), status: asStr(d.employment_status, "active"), hireDate: asStr(d.hire_date), endDate: asStr(d.termination_date),
    profile: asDict(d.profile), assignment: normAssignment(d.assignment),
  };
}

export function normPosition(v: unknown): Position {
  const d = asDict(v);
  return {
    id: asStr(d.id), code: asStr(d.code), title: asStr(d.title) || asStr(d.name), category: asStr(d.category), grade: asStr(d.grade),
    roleCode: asStr(d.default_role_code), description: asStr(d.description), status: asStr(d.status, "active"), requirements: asDict(d.requirements),
  };
}

export function normUnit(v: unknown): Unit {
  const d = asDict(v);
  return {
    id: asStr(d.id), code: asStr(d.code), name: asStr(d.name), type: asStr(d.unit_type, "department"), parentId: asStr(d.parent_id),
    headId: asStr(d.head_employee_id), status: asStr(d.status, "active"), order: asNum(d.order_index), meta: asDict(d.meta),
    people: (Array.isArray(d.people) ? d.people : []).map((p) => ({ ...normEmployee(asDict(p).employee), assignment: normAssignment(asDict(p).assignment) })),
  };
}
