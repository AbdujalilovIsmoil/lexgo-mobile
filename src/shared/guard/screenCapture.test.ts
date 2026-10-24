import { watchScreenCapture } from "./screenCapture";

type MockListener = (e: { captured?: boolean }) => void;
type Fake = { listeners: Set<MockListener>; state: { current: boolean } };

// A stand-in for modules/screen-guard: the current state and its change listeners.
jest.mock("expo-modules-core", () => {
  const listeners = new Set<MockListener>();
  const state = { current: false };
  const native = {
    isCapturedAsync: async () => state.current,
    addListener: (_: string, l: MockListener) => {
      listeners.add(l);
      return { remove: () => listeners.delete(l) };
    },
  };
  return { requireOptionalNativeModule: () => native, mockFake: { listeners, state } };
});

const { mockFake: fake } = jest.requireMock("expo-modules-core") as { mockFake: Fake };
const flush = () => new Promise((r) => setTimeout(r, 0));
const emit = (captured: boolean) => fake.listeners.forEach((l) => l({ captured }));

beforeEach(() => {
  fake.listeners.clear();
  fake.state.current = false;
});

describe("watchScreenCapture", () => {
  it("reports the current state, then every change", async () => {
    fake.state.current = true;
    const seen: boolean[] = [];
    const stop = watchScreenCapture((v) => seen.push(v));
    await flush();
    emit(false);
    expect(seen).toEqual([true, false]);
    stop();
  });

  it("a change that arrives before the first read wins over it", async () => {
    const seen: boolean[] = [];
    const stop = watchScreenCapture((v) => seen.push(v));
    emit(true);
    await flush();
    expect(seen).toEqual([true]);
    stop();
  });

  it("stops listening when unsubscribed", async () => {
    const seen: boolean[] = [];
    const stop = watchScreenCapture((v) => seen.push(v));
    await flush();
    stop();
    emit(true);
    expect(seen).toEqual([false]);
    expect(fake.listeners.size).toBe(0);
  });
});
