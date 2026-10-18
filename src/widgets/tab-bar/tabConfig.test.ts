import { TABS, allowedRoutes, homeRoute } from "./tabConfig";

describe("tab bars", () => {
  it("a visitor gets the client's bar; only Works and Messages ask to sign in", () => {
    expect(TABS.guest.map((x) => x.route)).toEqual(TABS.client.map((x) => x.route));
    expect(TABS.guest.filter((x) => x.auth).map((x) => x.route)).toEqual(["works", "messages"]);
    expect(TABS.client.some((x) => x.auth)).toBe(false);
  });
  it("a visitor lands on Home and may reach the public routes", () => {
    expect(homeRoute("guest")).toBe("index");
    expect(allowedRoutes("guest")).toEqual(expect.arrayContaining(["index", "services", "lawyers", "works", "messages"]));
  });
});
