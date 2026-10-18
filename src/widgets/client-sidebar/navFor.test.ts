import { isActive, navFor } from "./navItems";

const keys = (r: Parameters<typeof navFor>[0]) => navFor(r).map((x) => x.key);

describe("drawer rows per role", () => {
  it("client and visitor share the web portal's rows", () => {
    expect(navFor("guest")).toBe(navFor("client"));
  });
  it("every role has rows, a label for each and no duplicate keys", () => {
    for (const r of ["guest", "client", "seller", "callcenter", "staff"] as const) {
      const list = navFor(r);
      expect(list.length).toBeGreaterThan(4);
      expect(new Set(list.map((x) => x.key)).size).toBe(list.length);
      if (r !== "client" && r !== "guest") expect(list.every((x) => !!x.label)).toBe(true);
    }
  });
  it("a professional starts with their workspace and has the pro tools; staff with home", () => {
    expect(keys("seller").slice(0, 2)).toEqual(["dashboard", "marketplace"]);
    expect(keys("seller")).toEqual(expect.arrayContaining(["cases", "notifications", "security", "stats"]));
    expect(keys("callcenter")[0]).toBe("leads");
    expect(keys("staff")[0]).toBe("home");
  });
});

describe("seller drawer follows the web sidebar", () => {
  const WEB_LAWYER = ["dashboard", "marketplace", "marketplaceOrders", "cases", "urgentAssigned", "tasks", "calendar", "clients", "services", "documents", "documentRequests", "files", "chat", "meetings", "notifications", "ai", "assistant", "profile", "referrals", "promotion", "subscription", "support"];
  const WEB_ADVOCATE = ["dashboard", "opportunities", "marketplaceOrders", "cases", "urgentAssigned", "documentRequests", "calendar", "clients", "services", "tasks", "messages", "meetings", "notifications", "organization", "files", "assistant", "profile", "referrals", "promotion", "subscription", "support"];
  it("a yurist sees LAWYER_NAV in its order", () => expect(navFor("seller", { kind: "lawyer" }).map((i) => i.key).slice(0, WEB_LAWYER.length)).toEqual(WEB_LAWYER));
  it("an advokat sees ADVOCATE_NAV (organization only for the owner)", () => {
    expect(navFor("seller", { kind: "advocate", orgOwner: true }).map((i) => i.key).slice(0, WEB_ADVOCATE.length)).toEqual(WEB_ADVOCATE);
    expect(navFor("seller", { kind: "advocate" }).map((i) => i.key)).not.toContain("organization");
  });
  it("every row has a title in the web's words and a route inside the app", () => {
    for (const i of navFor("seller", { kind: "lawyer" })) {
      expect(i.label).toBeTruthy();
      expect(i.route.startsWith("/")).toBe(true);
    }
  });
});

describe("isActive", () => {
  it("tab routes match the path without the (tabs) group", () => {
    expect(isActive("/(tabs)/workspace", "/workspace")).toBe(true);
    expect(isActive("/(tabs)/clients", "/clients")).toBe(true);
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/pro/cases", "/pro/cases/abc")).toBe(true);
    expect(isActive("/pro/cases", "/pro/calendar")).toBe(false);
  });
});
