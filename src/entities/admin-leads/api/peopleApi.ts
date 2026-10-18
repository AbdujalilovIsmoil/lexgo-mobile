import { http } from "@/shared/api";
import { asArr, asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Operator } from "../model/types";

const roleName = (r: unknown): string => asStr(typeof r === "string" ? r : asDict(r).code ?? asDict(r).name);

// GET /admin/users?status=active (users.manage) → the call-center operators leads can be assigned to.
export async function listOperators(): Promise<Operator[]> {
  const rows = listFrom(await http("/admin/users?status=active"), "items", "data", "users").map((v) => {
    const d = asDict(v);
    const roles = [asStr(d.role), ...asArr(d.roles).map(roleName)];
    return {
      op: roles.some((r) => r === "call_center" || r === "call_center_lawyer"),
      user: {
        id: asStr(d.id),
        name: asStr(d.name) || [asStr(d.last_name), asStr(d.first_name)].filter(Boolean).join(" "),
        phone: asStr(d.phone),
        region: asStr(d.region),
        lexgoId: asStr(d.lexgo_id),
      },
    };
  });
  return rows.filter((r) => r.op && r.user.id).map((r) => r.user);
}

// GET /call-center/support/operators — the operator directory a call-center account may read (no users.manage needed).
export async function listCcOperators(): Promise<Operator[]> {
  return listFrom(await http("/call-center/support/operators?limit=100"), "items", "data", "operators")
    .map((v) => {
      const d = asDict(v);
      return { role: asStr(d.role), status: asStr(d.account_status, "active"), user: { id: asStr(d.id), name: asStr(d.name), phone: "", region: "", lexgoId: asStr(d.lexgo_id) } };
    })
    .filter((r) => r.user.id && r.status === "active" && (r.role === "call_center" || r.role === "call_center_lawyer"))
    .map((r) => r.user);
}
