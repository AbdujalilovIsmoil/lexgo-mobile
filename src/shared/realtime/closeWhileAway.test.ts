import { closeWhileAway } from "./closeWhileAway";
import type { ReconnectingSocket } from "./ReconnectingSocket";

const listeners: ((s: string) => void)[] = [];
jest.mock("react-native", () => ({
  AppState: { addEventListener: (_: string, f: (s: string) => void) => { listeners.push(f); return { remove: () => listeners.splice(listeners.indexOf(f), 1) }; } },
}));

const go = (s: string) => listeners.forEach((f) => f(s));
const fakeSocket = () => ({ start: jest.fn(), stop: jest.fn() });

describe("closeWhileAway", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("closes the socket after the grace period in the background and starts it again on return", () => {
    const sock = fakeSocket();
    const off = closeWhileAway(sock as unknown as ReconnectingSocket, 1000);
    go("background");
    jest.advanceTimersByTime(999);
    expect(sock.stop).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(sock.stop).toHaveBeenCalledTimes(1);
    go("active");
    expect(sock.start).toHaveBeenCalledTimes(1);
    go("active");
    expect(sock.start).toHaveBeenCalledTimes(1);
    off();
  });

  it("keeps the socket open through a quick switch to another app", () => {
    const sock = fakeSocket();
    const off = closeWhileAway(sock as unknown as ReconnectingSocket, 1000);
    go("inactive");
    go("background");
    jest.advanceTimersByTime(500);
    go("active");
    jest.advanceTimersByTime(5000);
    expect(sock.stop).not.toHaveBeenCalled();
    expect(sock.start).not.toHaveBeenCalled();
    off();
  });

  it("forgets the app state once released", () => {
    const sock = fakeSocket();
    closeWhileAway(sock as unknown as ReconnectingSocket, 1000)();
    go("background");
    jest.advanceTimersByTime(5000);
    expect(sock.stop).not.toHaveBeenCalled();
    expect(listeners).toHaveLength(0);
  });
});
