import { TABS, allowedRoutes, homeRoute, sellerTabHidden } from "./tabConfig";

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

describe("a professional's bar follows the permission rules (yurist and advokat alike)", () => {
  it("an account under review keeps the workspace and the AI button only", () => {
    expect(TABS.seller.filter((d) => !sellerTabHidden(d.route, true)).map((d) => d.route)).toEqual(["workspace", "ai"]);
  });
  it("the chats tab needs the secure_chat action; unknown hides nothing", () => {
    expect(sellerTabHidden("messages", false, { secureChat: false })).toBe(true);
    expect(sellerTabHidden("messages", false, { secureChat: true })).toBe(false);
    expect(sellerTabHidden("messages", false)).toBe(false);
    expect(sellerTabHidden("requests", false, { secureChat: false })).toBe(false);
  });
});
