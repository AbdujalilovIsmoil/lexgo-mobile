import { buildAccess, rolesOf } from "./access";
import { visibleModules } from "./modules";
import type { User } from "@/entities/session";

const u = (p: Partial<User>): User => ({ id: "1", name: "N", phone: "+998", role: "client", backendRole: "client", accountStatus: "active", roles: [], permissions: [], twoFactorEnabled: false, ...p }) as User;

describe("rolesOf", () => {
  it("lower-cases, trims and de-duplicates the assigned and primary roles", () => {
    expect(rolesOf(u({ backendRole: "Admin", roles: [" admin ", "Staff"] }))).toEqual(["admin", "staff"]);
    expect(rolesOf(null)).toEqual([]);
  });
});

describe("buildAccess", () => {
  it("a plain client has no staff access", () => {
    const a = buildAccess(u({}));
    expect(a).toMatchObject({ seller: false, admin: false, internal: false, staff: false, isSuper: false, canCalls: false });
    expect(a.can()).toBe(false);
    expect(a.can("users.manage")).toBe(false);
  });
  it("signed-out is the same as a plain client", () => {
    expect(buildAccess(null).staff).toBe(false);
  });
  it("superadmin passes every check, admin only the no-argument one", () => {
    const s = buildAccess(u({ roles: ["superadmin"] }));
    expect(s).toMatchObject({ isSuper: true, isFullAdmin: true, admin: true, staff: true });
    expect(s.can("anything")).toBe(true);
    const a = buildAccess(u({ roles: ["admin"] }));
    expect(a.can()).toBe(true);
    expect(a.can("users.manage")).toBe(false);
  });
  it("permissions unlock admin screens; any of a list is enough", () => {
    const a = buildAccess(u({ permissions: ["leads.manage"] }));
    expect(a.admin).toBe(true);
    expect(a.can(["x.y", "leads.manage"])).toBe(true);
    expect(a.can(["x.y"])).toBe(false);
  });
  it("sellers are not staff: orders.manage alone grants nothing", () => {
    const a = buildAccess(u({ role: "advocate", backendRole: "advokat", permissions: ["orders.manage", "meetings.manage"] }));
    expect(a).toMatchObject({ seller: true, admin: false, staff: false, canCalls: true });
  });
  it("call-centre roles", () => {
    expect(buildAccess(u({ roles: ["call_center"] }))).toMatchObject({ callCenter: true, callCenterOperator: true, canCalls: true });
    expect(buildAccess(u({ role: "lawyer", roles: ["call_center"] })).callCenterOperator).toBe(false);
    expect(buildAccess(u({ roles: ["call_center_lawyer"] })).callCenterLawyer).toBe(true);
  });
  it("internal area: manager is limited, full admin is not", () => {
    const m = buildAccess(u({ roles: ["manager"] }));
    expect(m.internal).toBe(true);
    expect(m.canInternal("internal_kpi.manage")).toBe(true);
    expect(m.canInternal("internal_payroll.manage")).toBe(false);
    expect(buildAccess(u({ roles: ["admin"] })).canInternal("internal_payroll.manage")).toBe(true);
    expect(buildAccess(u({ permissions: ["internal_hr.manage"] })).canInternal("internal_hr.manage")).toBe(true);
  });
  it("org owner", () => {
    expect(buildAccess(u({ backendRole: "advokat_tashkiloti" })).orgOwner).toBe(true);
    expect(buildAccess(u({ roles: ["organization_owner"] })).orgOwner).toBe(true);
  });
});

describe("sales operator (the web's \"Sotuv operatori\")", () => {
  const SALES_PERMS = ["leads.manage", "notifications.manage", "orders.manage", "sales.access"];
  it("is the role itself, never a seller or a full admin", () => {
    expect(buildAccess(u({ roles: ["sales_operator"], permissions: SALES_PERMS }))).toMatchObject({ salesOperator: true, admin: true, staff: true });
    expect(buildAccess(u({ role: "lawyer", roles: ["sales_operator"] })).salesOperator).toBe(false);
    expect(buildAccess(u({ roles: ["admin", "sales_operator"] })).salesOperator).toBe(false);
    expect(buildAccess(u({ permissions: SALES_PERMS })).salesOperator).toBe(false);
  });
  it("gets exactly the modules of the web sidebar of the role", () => {
    const a = buildAccess(u({ roles: ["sales_operator"], permissions: SALES_PERMS }));
    expect(visibleModules(a).map((m) => m.key)).toEqual(["pipeline", "callcenter", "meetings", "callAnalytics", "marketplace", "notifications"]);
  });
  it("other staff with the same permissions keep the mobile-only modules", () => {
    expect(visibleModules(buildAccess(u({ permissions: SALES_PERMS }))).map((m) => m.key)).toEqual(expect.arrayContaining(["retention", "chats"]));
  });
});

describe("on-duty call-centre lawyer (the web's \"Navbatchi yurist\")", () => {
  // An advocate account that also carries call_center_lawyer + sales_operator, with the permissions the web panel grants.
  const PERMS = ["callcenter.access", "cases.manage", "documents.manage", "leads.manage", "meetings.manage", "notifications.manage", "orders.manage", "sales.access", "tasks.status.ready", "templates.manage"];
  const duty = u({ role: "advocate", backendRole: "advokat", roles: ["call_center_lawyer", "sales_operator"], permissions: PERMS });
  it("gets exactly the modules of the web sidebar, in its order", () => {
    expect(visibleModules(buildAccess(duty)).map((m) => m.key)).toEqual(["pipeline", "callcenter", "meetings", "callAnalytics", "marketplace", "templates", "support", "notifications"]);
  });
  it("a plain advocate with the same permissions keeps the mobile-only modules", () => {
    expect(visibleModules(buildAccess(u({ role: "advocate", backendRole: "advokat", permissions: PERMS }))).map((m) => m.key)).toEqual(expect.arrayContaining(["retention", "chats"]));
  });
});
