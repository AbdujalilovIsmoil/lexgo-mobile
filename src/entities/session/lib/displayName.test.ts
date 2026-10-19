import { displayName } from "./displayName";

describe("displayName", () => {
  it("keeps the full name the backend sends, never only the first word", () => {
    expect(displayName({ name: "LexGo Yuristi", firstName: "LexGo", lastName: "Yuristi" })).toBe("LexGo Yuristi");
    expect(displayName({ name: "LexGo Advokati", firstName: "LexGo" })).toBe("LexGo Advokati");
    expect(displayName({ name: "Abdujalilov Ismoil Rustamovich" })).toBe("Abdujalilov Ismoil Rustamovich");
  });
  it("tidies spaces", () => {
    expect(displayName({ name: "  LexGo   Yuristi " })).toBe("LexGo Yuristi");
  });
  it("falls back to first + last name, then to nothing", () => {
    expect(displayName({ name: "", firstName: "Ismoil", lastName: "Abdujalilov" })).toBe("Ismoil Abdujalilov");
    expect(displayName({ name: " ", firstName: "Ismoil" })).toBe("Ismoil");
    expect(displayName({ name: "" })).toBe("");
    expect(displayName(undefined)).toBe("");
    expect(displayName(null)).toBe("");
  });
});
