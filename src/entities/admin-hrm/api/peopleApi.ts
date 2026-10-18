import { asArr, asDict } from "@/shared/lib/json";
import { hrmGet, hrmPatch, hrmPost } from "./core";
import { hrmListAll } from "./opsAll";
import { normAssignment, normEmployee, normPosition } from "./normPeople";
import { normTask } from "./normWork";
import { normDay, normKpi, normPayroll } from "./normOps";
import type { Employee, Position } from "../model/types";
import type { Employee360 } from "../model/typesOps";

export type EmployeeInput = { firstName: string; lastName: string; phone: string; email: string; region: string; status: string; userId?: string; hireDate?: string };
export type AssignInput = { unitId: string; positionId: string; managerId: string; salary: number; employmentType?: string; rate?: number };
export type PositionInput = { title: string; code: string; category: string; grade: string; description: string; status: string };

// PATCH replaces the whole record (missing fields are reset, user_id included), so it always carries the current values.
function employeeBody(i: EmployeeInput, base?: Employee) {
  return {
    first_name: i.firstName, last_name: i.lastName, middle_name: base?.middleName ?? "", display_name: `${i.firstName} ${i.lastName}`.trim(),
    phone: i.phone, email: i.email, region: i.region, employment_status: i.status, profile: base?.profile ?? {},
    user_id: i.userId !== undefined ? i.userId || null : base?.userId || null,
    hire_date: i.hireDate !== undefined ? (i.hireDate ? `${i.hireDate}T00:00:00+05:00` : null) : base?.hireDate || null,
    ...(base ? { termination_date: base.endDate || null } : {}),
  };
}

export const listEmployees = async () => (await hrmListAll("/employees", {})).map(normEmployee);
export const createEmployee = async (i: EmployeeInput) => normEmployee(await hrmPost("/employees", employeeBody(i)));
export const updateEmployee = async (base: Employee, i: EmployeeInput) => normEmployee(await hrmPatch(`/employees/${base.id}`, employeeBody(i, base)));

export async function assignEmployee(employeeId: string, i: AssignInput, base?: Employee) {
  const a = base?.assignment;
  return normAssignment(await hrmPost("/employees/assignments", {
    employee_id: employeeId, org_unit_id: i.unitId || null, position_id: i.positionId || null, manager_employee_id: i.managerId || null,
    employment_type: i.employmentType ?? a?.employmentType ?? "full_time", rate: i.rate ?? a?.rate ?? 100, salary_amount: i.salary || null, currency: a?.currency ?? "UZS", status: "active", meta: {},
  }));
}

export async function get360(id: string): Promise<Employee360> {
  const d = asDict(await hrmGet(`/employees/${id}/360`));
  return {
    employee: normEmployee(d.employee), tasks: asArr(d.tasks).map(normTask), attendance: asArr(d.attendance).map(normDay),
    kpis: asArr(d.kpis).map(normKpi), payroll: asArr(d.payroll).map(normPayroll),
  };
}

const positionBody = (i: PositionInput, base?: Position) => ({
  title: i.title, code: i.code, category: i.category, grade: i.grade, description: i.description, status: i.status,
  default_role_code: base?.roleCode ?? "", requirements: base?.requirements ?? {},
});
export const listPositions = async () => (await hrmListAll("/org/positions", {})).map(normPosition);
export const createPosition = async (i: PositionInput) => normPosition(await hrmPost("/org/positions", positionBody(i)));
export const updatePosition = async (base: Position, i: PositionInput) => normPosition(await hrmPatch(`/org/positions/${base.id}`, positionBody(i, base)));
