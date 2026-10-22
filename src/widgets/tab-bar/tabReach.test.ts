import { rewritePath, setBarRoutes } from "./tabReach";

jest.mock("expo-router", () => ({ router: {} }));

describe("rewritePath", () => {
  beforeEach(() => setBarRoutes(["index", "services", "ai", "works", "messages"])); // a client's bar

  it("opens a tab the bar does not show as a stack screen — the (tabs) form and the bare form the sidebar uses", () => {
    expect(rewritePath("/(tabs)/orders")).toBe("/m/orders");
    expect(rewritePath("/orders")).toBe("/m/orders");
    expect(rewritePath("/lawyers")).toBe("/m/lawyers");
    expect(rewritePath("/lawyers?q=a")).toBe("/m/lawyers?q=a");
    expect(rewritePath("/profile")).toBe("/m/profile");
  });
  it("leaves the tabs the bar shows (the tab switches)", () => {
    expect(rewritePath("/works")).toBe("/works");
    expect(rewritePath("/messages")).toBe("/messages");
    expect(rewritePath("/(tabs)/services")).toBe("/(tabs)/services");
  });
  it("leaves real stack screens and other pages alone", () => {
    expect(rewritePath("/orders/abc")).toBe("/orders/abc");
    expect(rewritePath("/services/42")).toBe("/services/42");
    expect(rewritePath("/academy")).toBe("/academy");
    expect(rewritePath("/")).toBe("/");
    expect(rewritePath("/m/orders")).toBe("/m/orders");
  });
});
