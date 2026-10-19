import { moduleHref } from "./moduleHref";

describe("moduleHref", () => {
  it("a sales operator's funnel, duty desk and meetings open their tabs", () => {
    const so = { salesOperator: true };
    expect(moduleHref("pipeline", so)).toBe("/(tabs)/pipeline");
    expect(moduleHref("callcenter", so)).toBe("/(tabs)/duty");
    expect(moduleHref("meetings", so)).toBe("/(tabs)/smeetings");
    expect(moduleHref("marketplace", so)).toBe("/manage/marketplace");
  });
  it("everyone else opens the admin screen", () => {
    expect(moduleHref("pipeline", { salesOperator: false })).toBe("/manage/pipeline");
  });
});
