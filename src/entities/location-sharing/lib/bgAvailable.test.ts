import { bgLocationBuilt } from "./bgAvailable";

jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { plugins: [] } } }));

describe("background location in this build", () => {
  it("follows the expo-location plugin flags per platform", () => {
    const on = [["expo-location", { isAndroidBackgroundLocationEnabled: true, isIosBackgroundLocationEnabled: false }]] as never;
    expect(bgLocationBuilt(on, "android")).toBe(true);
    expect(bgLocationBuilt(on, "ios")).toBe(false);
  });
  it("is off when the plugin is missing or configured off", () => {
    expect(bgLocationBuilt([], "android")).toBe(false);
    expect(bgLocationBuilt(["expo-location"] as never, "android")).toBe(false);
    expect(bgLocationBuilt([["expo-location", { isAndroidBackgroundLocationEnabled: false }]] as never, "android")).toBe(false);
  });
});
