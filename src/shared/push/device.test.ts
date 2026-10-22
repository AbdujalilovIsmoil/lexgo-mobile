import { buildRegistration } from "./device";

jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.1.0" }));
jest.mock("expo-crypto", () => ({ randomUUID: () => "u" }));
jest.mock("@/shared/api", () => ({ http: jest.fn() }));
jest.mock("@/shared/lib/storage", () => ({ readSecret: jest.fn(), writeSecret: jest.fn() }));

describe("buildRegistration", () => {
  it("Android sends an FCM token, iOS the APNs alert token, with the install, version and language", () => {
    expect(buildRegistration("tok-12345678", "inst", "ru", "android")).toMatchObject({ platform: "android", token_type: "fcm", token: "tok-12345678", installation_id: "inst", app_version: "1.1.0", locale: "ru" });
    expect(buildRegistration("tok-12345678", "inst", "uz", "ios")).toMatchObject({ platform: "ios", token_type: "apns", locale: "uz" });
  });
});
