import { Autosaver, type SaveState } from "./autosaver";

const make = (run: (j: string) => Promise<void>) => {
  const states: SaveState[] = [];
  const a = new Autosaver(run, (s) => states.push(s), 800);
  return { a, states };
};
const tick = async (ms: number) => { jest.advanceTimersByTime(ms); for (let i = 0; i < 6; i++) await Promise.resolve(); };

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("Autosaver", () => {
  it("saves the full answers once, 800 ms after the last change", async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const { a, states } = make(run);
    a.baseline("{}");
    a.push('{"a":"1"}');
    await tick(500);
    a.push('{"a":"12"}');
    await tick(799);
    expect(run).not.toHaveBeenCalled();
    await tick(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith('{"a":"12"}');
    expect(states).toEqual(["saving", "saved"]);
  });

  it("never runs two saves at once: a change during a save goes out right after it", async () => {
    let release: () => void = () => {};
    const run = jest.fn().mockImplementationOnce(() => new Promise<void>((r) => { release = r; })).mockResolvedValue(undefined);
    const { a, states } = make(run);
    a.baseline("{}");
    a.push('{"a":"1"}');
    await tick(800);
    expect(run).toHaveBeenCalledTimes(1);
    a.push('{"a":"12"}');
    await tick(800);
    expect(run).toHaveBeenCalledTimes(1); // still in flight
    release();
    await tick(0);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenLastCalledWith('{"a":"12"}');
    expect(states[states.length - 1]).toBe("saved");
  });

  it("a failed save keeps the answers and waits for retry, which sends them again", async () => {
    const run = jest.fn().mockRejectedValueOnce(new Error("net")).mockResolvedValue(undefined);
    const { a, states } = make(run);
    a.baseline("{}");
    a.push('{"a":"1"}');
    await tick(800);
    expect(a.state).toBe("error");
    await tick(5000);
    expect(run).toHaveBeenCalledTimes(1); // no blind loop
    await a.retry();
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenLastCalledWith('{"a":"1"}');
    expect(states).toEqual(["saving", "error", "saving", "saved"]);
  });

  it("sends nothing when the answers equal what the server holds, and flush saves a pending change at once", async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const { a } = make(run);
    a.baseline('{"a":"1"}');
    a.push('{"a":"1"}');
    await tick(2000);
    expect(run).not.toHaveBeenCalled();
    a.push('{"a":"2"}');
    await a.flush();
    expect(run).toHaveBeenCalledWith('{"a":"2"}');
  });
});
