import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { UserDetail, UserEdit } from "../model/typesAdmin";
import { normUserHit } from "./userApi";

export function normUserDetail(v: unknown): UserDetail {
  const d = asDict(v);
  return {
    ...normUserHit(v), firstName: asStr(d.first_name), lastName: asStr(d.last_name), middleName: asStr(d.middle_name),
    referralCode: asStr(d.referral_code), referredBy: asStr(d.referred_by_code), phoneVerified: d.phone_verified === true,
  };
}

const enc = encodeURIComponent;

// GET /admin/users/{id} (users.manage).
export const getUser = async (id: string) => normUserDetail(await http(`/admin/users/${enc(id)}`));

// PATCH /admin/users/{id} — only the given fields change; the server also accepts any account_status string,
// so the app only sends the three it knows (active / blocked / pending).
export const updateUser = async (id: string, e: UserEdit) =>
  normUserDetail(await http(`/admin/users/${enc(id)}`, { method: "PATCH", body: { first_name: e.firstName, last_name: e.lastName, middle_name: e.middleName, account_status: e.status } }));

// DELETE /admin/users/{id} — a soft delete (account_status becomes "deleted").
export const deleteUser = (id: string) => http(`/admin/users/${enc(id)}`, { method: "DELETE" });
