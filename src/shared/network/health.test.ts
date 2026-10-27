import { probeHealth } from "./health";
import { useNetStore } from "./netStore";
import { probeApi } from "./probe";
import { noteReached } from "./reach";

jest.mock("./probe", () => ({ probeApi: jest.fn() }));
jest.mock("./netLog", () => ({ netLog: jest.fn() }));
jest.mock("./NetworkMonitor", () => ({ noteApiUnreachable: jest.fn().mockResolvedValue(false) }));

const probe = probeApi as jest.Mock;
const ok = { ok: true, error: "", ms: 80, status: 200, text: JSON.stringify({ status: "ok", time: "2026-10-27T06:00:00.000000" }) };
const quick = { ok: false, error: "The network connection was lost.", ms: 5, status: 0, text: "" };
const timeout = { ok: false, error: "timeout 10000 ms", ms: 10_000, status: 0, text: "" };

describe("probeHealth", () => {
  let clock = Date.parse("2026-10-27T05:00:00Z");
  beforeEach(() => {
    jest.useFakeTimers();
    clock += 3_600_000; // an hour later: what an earlier test noted as "answered" is long past
    jest.setSystemTime(clock);
    probe.mockReset();
    useNetStore.setState({ online: true, serverDown: false, skewMs: 0 });
  });
  afterEach(() => jest.useRealTimers());

  it("an answer means up, and gives the clock skew", async () => {
    probe.mockResolvedValue({ ...ok, text: JSON.stringify({ time: new Date(clock - 10_000).toISOString().replace("Z", "") }) });
    await expect(probeHealth()).resolves.toBe(true);
    expect(useNetStore.getState().serverDown).toBe(false);
    expect(useNetStore.getState().skewMs).toBeLessThan(-9000);
  });

  it("requests failing at once after a return to the app do not make the server 'down' within the first seconds", async () => {
    probe.mockResolvedValueOnce(quick).mockResolvedValueOnce(quick).mockResolvedValue(ok);
    const run = probeHealth();
    await jest.advanceTimersByTimeAsync(20_000);
    await expect(run).resolves.toBe(true);
    expect(useNetStore.getState().serverDown).toBe(false);
    expect(probe).toHaveBeenCalledTimes(3);
  });

  it("'server down' only after three probes and 25 s without any answer", async () => {
    probe.mockResolvedValue(quick);
    const run = probeHealth();
    await jest.advanceTimersByTimeAsync(20_000);
    expect(useNetStore.getState().serverDown).toBe(false);
    await jest.advanceTimersByTimeAsync(15_000);
    await expect(run).resolves.toBe(false);
    expect(useNetStore.getState().serverDown).toBe(true);
  });

  it("probes that time out behind a screen's requests do not count while those requests are answered", async () => {
    probe.mockImplementation(async () => {
      noteReached(200); // a real request came back while the probe waited
      return timeout;
    });
    await expect(probeHealth()).resolves.toBe(true);
    expect(useNetStore.getState().serverDown).toBe(false);
  });

  it("a gateway error (502) is not an answer that keeps the server 'up'", async () => {
    probe.mockResolvedValue({ ...ok, status: 502, text: "" });
    const run = probeHealth();
    await jest.advanceTimersByTimeAsync(40_000);
    await expect(run).resolves.toBe(false);
    expect(useNetStore.getState().serverDown).toBe(true);
  });
});
