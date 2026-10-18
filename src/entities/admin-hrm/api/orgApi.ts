import { hrmGet, hrmPatch, hrmPost } from "./core";
import { normUnit } from "./normPeople";
import { normBoard } from "./normOrg";
import type { OrgBoard, Unit } from "../model/types";

export type UnitInput = { name: string; code: string; type: string; parentId: string; status: string };

// PATCH replaces the unit, so head, order and meta are carried over from the loaded record.
const unitBody = (i: UnitInput, base?: Unit) => ({
  name: i.name, code: i.code, unit_type: i.type, parent_id: i.parentId || null, status: i.status,
  head_employee_id: base?.headId || null, order_index: base?.order ?? 0, meta: base?.meta ?? {},
});

export const getBoard = async (): Promise<OrgBoard> => normBoard(await hrmGet("/org/board", { include: "people" }));
export const getUnit = async (id: string) => normUnit(await hrmGet(`/org/units/${id}`));
export const createUnit = async (i: UnitInput) => normUnit(await hrmPost("/org/units", unitBody(i)));
export const updateUnit = async (base: Unit, i: UnitInput) => normUnit(await hrmPatch(`/org/units/${base.id}`, unitBody(i, base)));
