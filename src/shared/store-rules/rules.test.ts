import { digitalSalesOn, isDigitalRoute, storeRows } from "./rules";

describe("store rules (App Store 3.1.1)", () => {
  it("sells digital goods everywhere but iOS", () => {
    expect(digitalSalesOn("ios")).toBe(false);
    expect(digitalSalesOn("android")).toBe(true);
  });
  it("knows the digital-goods screens, whole segments only", () => {
    for (const r of ["/subscription", "/subscriptions?x=1", "/entitlements", "/profile/gifts", "/profile/gifts?code=A", "/profile/methods", "/pro/promotions", "/pro/promotions/new", "/subscription/"]) expect(isDigitalRoute(r)).toBe(true);
    for (const r of ["/", "/payments", "/payments/1", "/packages", "/pro/packages", "/profile/giftsx", "/orders", "/services"]) expect(isDigitalRoute(r)).toBe(false);
  });
  it("drops those rows only when sales are off", () => {
    const rows = [{ route: "/payments" }, { route: "/subscription" }, { route: "/profile/gifts" }];
    expect(storeRows(rows, (r) => r.route, true)).toHaveLength(3);
    expect(storeRows(rows, (r) => r.route, false)).toEqual([{ route: "/payments" }]);
  });
});
