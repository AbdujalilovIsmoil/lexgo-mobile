import * as Notifications from "expo-notifications";
import { http } from "@/shared/api";
import { dismissCallAlerts } from "./schedule";
import { deviceId } from "./device";
import { forgetPushToken, registerPushToken } from "./token";

const mockStore = new Map<string, string>();
jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.1.0" }));
jest.mock("expo-crypto", () => ({ randomUUID: () => "install-1" }));
jest.mock("@/shared/api", () => ({ http: jest.fn() }));
jest.mock("@/shared/analytics", () => ({ track: () => undefined }));
jest.mock("@/shared/i18n/localeStore", () => ({ useLocaleStore: { getState: () => ({ locale: "ru" }) } }));
jest.mock("@/shared/lib/storage", () => ({
  readSecret: async (k: string) => mockStore.get(k) ?? null,
  writeSecret: async (k: string, v: string | null) => void (v == null ? mockStore.delete(k) : mockStore.set(k, v)),
}));
jest.mock("./permission", () => ({ readPermission: jest.fn(async () => ({ status: "granted" })) }));
jest.mock("expo-notifications", () => ({
  SchedulableTriggerInputTypes: {}, AndroidImportance: {}, AndroidNotificationVisibility: {},
  getDevicePushTokenAsync: jest.fn(async () => ({ type: "android", data: "fcm-token-123456" })),
  getPresentedNotificationsAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(async () => undefined),
}));

const post = http as jest.Mock;
beforeEach(() => { (Notifications.getDevicePushTokenAsync as jest.Mock).mockClear(); mockStore.clear(); post.mockReset(); post.mockResolvedValue({ id: "dev-9" }); });

describe("registerPushToken", () => {
  it("posts the registration once, keeps the device id, and does not repeat an unchanged one", async () => {
    expect(await registerPushToken()).toBe("uploaded");
    expect(post).toHaveBeenCalledWith("/devices", expect.objectContaining({ method: "POST", body: expect.objectContaining({ token: "fcm-token-123456", installation_id: "install-1", locale: "ru", app_version: "1.1.0" }) }));
    expect(await deviceId()).toBe("dev-9");
    expect(await registerPushToken()).toBe("unchanged");
    expect(post).toHaveBeenCalledTimes(1);
  });
  it("a rotated token is sent again (forced), without asking the OS", async () => {
    await registerPushToken();
    expect(await registerPushToken("new-token-98765", true)).toBe("uploaded");
    expect(post).toHaveBeenCalledTimes(2);
    expect(Notifications.getDevicePushTokenAsync).toHaveBeenCalledTimes(1);
  });
  it("no token (no Firebase in the build) or a failing request is an error, never a throw", async () => {
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockRejectedValueOnce(new Error("no firebase"));
    expect(await registerPushToken()).toBe("error");
    post.mockRejectedValueOnce(new Error("offline"));
    expect(await registerPushToken()).toBe("error");
  });
});

describe("forgetPushToken", () => {
  it("deletes the token on the backend and forgets the device", async () => {
    await registerPushToken();
    await forgetPushToken();
    expect(post).toHaveBeenLastCalledWith("/devices", { method: "DELETE", body: { token: "fcm-token-123456" } });
    expect(await deviceId()).toBe("");
    post.mockClear();
    await forgetPushToken(); // nothing left: no request
    expect(post).not.toHaveBeenCalled();
  });
});

describe("dismissCallAlerts", () => {
  it("removes the notifications of that call only (by identifier or call_id)", async () => {
    const n = (identifier: string, data: Record<string, unknown> = {}) => ({ request: { identifier, content: { data } } });
    (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([n("call-c1"), n("x", { call_id: "c1" }), n("call-c2"), n("c1")]);
    await dismissCallAlerts("c1");
    const gone = (Notifications.dismissNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]).sort();
    expect(gone).toEqual(["c1", "call-c1", "x"]);
  });
});
