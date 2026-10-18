import type { Dict } from "@/shared/lib/json";

export type Assignment = {
  id: string; unitId: string; positionId: string; managerId: string; employmentType: string;
  rate: number; salary: number; currency: string; status: string;
};
export type Employee = {
  id: string; userId: string; code: string; name: string; firstName: string; lastName: string; middleName: string;
  phone: string; email: string; region: string; status: string; hireDate: string; endDate: string;
  profile: Dict; assignment: Assignment | null;
};
export type Position = { id: string; code: string; title: string; category: string; grade: string; roleCode: string; description: string; status: string; requirements: Dict };
export type Unit = { id: string; code: string; name: string; type: string; parentId: string; headId: string; status: string; order: number; meta: Dict; people: Employee[] };
// One node of the org board: a unit ("unit") or a person placed in it ("person").
export type OrgNode = {
  id: string; entityId: string; kind: "unit" | "person"; label: string; sub: string; parentId: string;
  unitType: string; people: number; positions: number; level: number; children: number; head: string;
};
export type OrgStats = { units: number; employees: number; assignments: number; roots: number; levels: number };
export type OrgBoard = { nodes: OrgNode[]; stats: OrgStats };
