import { NetworkStateType } from "expo-network";
import { applyNetworkState } from "./NetworkMonitor";
import { useNetStore } from "./netStore";
import { readOsPath, type OsPath } from "./osPath";
import { probeApi } from "./probe";

jest.mock("react-native", () => ({ Platform: { OS: "ios", Version: "26.5" } }));
jest.mock("expo-network", () => ({
  NetworkStateType: { NONE: "NONE", WIFI: "WIFI", CELLULAR: "CELLULAR", ETHERNET: "ETHERNET", UNKNOWN: "UNKNOWN" },
  addNetworkStateListener: jest.fn(),
  getNetworkStateAsync: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({ onlineManager: { setOnline: jest.fn() } }));
jest.mock("@/shared/api", () => ({ onReached: jest.fn() }));
jest.mock("./netLog", () => ({ netLog: jest.fn(), netLogText: () => "" }));
jest.mock("./probe", () => ({ probeApi: jest.fn() }));
jest.mock("./osPath", () => ({ ...jest.requireActual("./osPath"), readOsPath: jest.fn() }));
jest.mock("expo-modules-core", () => ({ requireOptionalNativeModule: () => null }));

const probe = probeApi as jest.Mock;
const osPath = readOsPath as jest.Mock;
const ok = { ok: true, error: "", ms: 120 };
const fail = (error: string) => ({ ok: false, error, ms: 5 });
const path = (p: Partial<OsPath>): OsPath => ({ status: "unsatisfied", reason: "notAvailable", interfaces: [], ...p });
const osSays = (isConnected: boolean, isInternetReachable: boolean) => ({ type: isConnected ? NetworkStateType.WIFI : NetworkStateType.NONE, isConnected, isInternetReachable });
const settle = () => jest.advanceTimersByTimeAsync(5000);

describe("applyNetworkState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    probe.mockReset();
    osPath.mockReset().mockResolvedValue(path({}));
    useNetStore.setState({ online: true, offlineSince: 0, cause: "", detail: "" });
  });
  afterEach(() => jest.useRealTimers());

  it("a connected OS state is online at once, without a request", async () => {
    applyNetworkState(osSays(true, true));
    await settle();
    expect(useNetStore.getState().online).toBe(true);
    expect(probe).not.toHaveBeenCalled();
  });

  it("the OS saying 'offline' is not believed while the API answers (a stuck iOS path / a missed update)", async () => {
    probe.mockResolvedValue(ok);
    applyNetworkState(osSays(false, false));
    await settle();
    expect(useNetStore.getState().online).toBe(true);
    expect(probe).toHaveBeenCalledTimes(1);
  });

  it("offline only when the API cannot be reached either (two tries); the OS's error text is kept for the settings card", async () => {
    probe.mockResolvedValue(fail("The Internet connection appears to be offline."));
    applyNetworkState(osSays(false, false));
    await settle();
    const s = useNetStore.getState();
    expect(probe).toHaveBeenCalledTimes(2);
    expect(s.online).toBe(false);
    expect(s.cause).toBe("no_network");
    expect(s.detail).toContain("appears to be offline");
    expect(s.offlineSince).toBeGreaterThan(0);
  });

  it("a phone that has a network but does not let LexGo use it (Mobile Data off for the app) is 'denied', not 'no internet'", async () => {
    probe.mockResolvedValue(fail("The Internet connection appears to be offline."));
    osPath.mockResolvedValue(path({ reason: "cellularDenied", interfaces: ["cellular"] }));
    applyNetworkState(osSays(false, false));
    await settle();
    expect(useNetStore.getState().cause).toBe("denied");
    expect(useNetStore.getState().detail).toContain("cellularDenied");
  });

  it("one dropped request does not read as offline", async () => {
    probe.mockResolvedValueOnce(fail("The request timed out.")).mockResolvedValue(ok);
    applyNetworkState(osSays(true, false));
    await settle();
    expect(useNetStore.getState().online).toBe(true);
  });

  it("coming back online clears the cause and the detail", async () => {
    useNetStore.setState({ online: false, cause: "denied", detail: "x" });
    applyNetworkState(osSays(true, true));
    await settle();
    expect(useNetStore.getState()).toMatchObject({ online: true, cause: "", detail: "" });
  });
});
