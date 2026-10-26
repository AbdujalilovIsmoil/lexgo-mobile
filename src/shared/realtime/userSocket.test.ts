import { onResync } from "./bus";
import { connectUserSocket, disconnectUserSocket } from "./controls";

jest.mock("@/shared/config/env", () => ({ WS_BASE: "wss://test" }));

// A stand-in WebSocket: every new one is kept so the test can open / close it.
class FakeSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static all: FakeSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((m: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {
    FakeSocket.all.push(this);
  }
  send() {}
  close() {
    this.readyState = 3;
  }
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
  drop() {
    this.readyState = 3;
    this.onclose?.();
  }
}
const last = () => FakeSocket.all[FakeSocket.all.length - 1];

describe("user socket", () => {
  const resynced = jest.fn();
  let off: () => void;
  beforeAll(() => {
    (globalThis as { WebSocket?: unknown }).WebSocket = FakeSocket;
  });
  beforeEach(() => {
    jest.useFakeTimers();
    FakeSocket.all = [];
    resynced.mockClear();
    off = onResync(resynced);
  });
  afterEach(() => {
    off();
    disconnectUserSocket();
    jest.useRealTimers();
  });

  it("re-reads the screens after a real reconnect, not after the first connect", () => {
    connectUserSocket("t1");
    last().open();
    expect(resynced).not.toHaveBeenCalled();
    last().drop();
    jest.advanceTimersByTime(2000);
    last().open();
    expect(resynced).toHaveBeenCalledTimes(1);
  });

  it("does not re-read everything when only the token of a live socket changes", () => {
    connectUserSocket("t1");
    last().open();
    connectUserSocket("t2");
    expect(last().url).toContain("t2");
    last().open();
    expect(resynced).not.toHaveBeenCalled();
  });

  it("still re-reads when the token changes while the socket was down", () => {
    connectUserSocket("t1");
    last().open();
    last().drop();
    connectUserSocket("t2");
    last().open();
    expect(resynced).toHaveBeenCalledTimes(1);
  });
});
