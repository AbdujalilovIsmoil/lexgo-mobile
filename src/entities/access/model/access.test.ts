import { buildAccess } from "./access";
import type { User } from "@/entities/session";

const u = (p: Partial<User>): User => ({ id: "1", name: "N", phone: "+998", role: "client", backendRole: "client", accountStatus: "active", roles: [], permissions: [], twoFactorEnabled: false, ...p }) as User;

describe("buildAccess", () => {
  it("a client is not a professional; signed-out is the same", () => {
    expect(buildAccess(u({})).seller).toBe(false);
    expect(buildAccess(null).seller).toBe(false);
  });
  it("an advokat and a yurist are professionals", () => {
    expect(buildAccess(u({ role: "advocate", backendRole: "advokat" })).seller).toBe(true);
    expect(buildAccess(u({ role: "lawyer", backendRole: "yurist" })).seller).toBe(true);
  });
  it("a permission is granted only when the backend sent it; a list needs any one of them", () => {
    const a = buildAccess(u({ permissions: ["tasks.view"] }));
    expect(a.can("tasks.view")).toBe(true);
    expect(a.can("tasks.manage")).toBe(false);
    expect(a.can(["tasks.manage", "tasks.view"])).toBe(true);
    expect(buildAccess(null).can("tasks.view")).toBe(false);
  });
  it("an assigned staff role opens nothing on mobile", () => {
    const a = buildAccess(u({ roles: ["superadmin", "admin", "call_center"] }));
    expect(a.seller).toBe(false);
    expect(a.can("users.manage")).toBe(false);
  });
});
