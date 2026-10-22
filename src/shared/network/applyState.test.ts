import { NetworkStateType } from "expo-network";
import { applyNetworkState } from "./NetworkMonitor";
import { useNetStore } from "./netStore";

jest.mock("expo-network", () => ({
  NetworkStateType: { NONE: "NONE", WIFI: "WIFI", CELLULAR: "CELLULAR", ETHERNET: "ETHERNET", UNKNOWN: "UNKNOWN" },
  addNetworkStateListener: jest.fn(),
  getNetworkStateAsync: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({ onlineManager: { setOnline: jest.fn() } }));
jest.mock("@/shared/api", () => ({ onReached: jest.fn() }));

const flush = async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); };
const osSays = (isConnected: boolean, isInternetReachable: boolean) => ({ type: isConnected ? NetworkStateType.WIFI : NetworkStateType.NONE, isConnected, isInternetReachable });

describe("applyNetworkState", () => {
  beforeEach(() => { useNetStore.setState({ online: true, offlineSince: 0 }); jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

  it("a connected OS state is online at once, without a request", () => {
    const f = jest.spyOn(globalThis, "fetch");
    applyNetworkState(osSays(true, true));
    expect(useNetStore.getState().online).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it("the OS saying 'offline' is not believed while the API answers (a stuck iOS path / a missed update)", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue({} as Response);
    applyNetworkState(osSays(false, false));
    await flush();
    expect(useNetStore.getState().online).toBe(true);
  });

  it("offline only when the API cannot be reached either (two tries), and the banner state keeps its start time", async () => {
    const f = jest.spyOn(globalThis, "fetch").mockRejectedValue(new Error("down"));
    applyNetworkState(osSays(false, false));
    await flush();
    expect(f).toHaveBeenCalledTimes(2);
    expect(useNetStore.getState().online).toBe(false);
    expect(useNetStore.getState().offlineSince).toBeGreaterThan(0);
  });

  it("one dropped request does not read as offline", async () => {
    jest.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("blip")).mockResolvedValue({} as Response);
    applyNetworkState(osSays(true, false));
    await flush();
    expect(useNetStore.getState().online).toBe(true);
  });
});
