import { subscribeUserEvents } from "./bus";
import { backoff, onFrame, PING_MS } from "./frames";

describe("user socket frames", () => {
  it("delivers JSON frames with an event name and drops pong / junk", () => {
    const seen: string[] = [];
    const off = subscribeUserEvents((e) => seen.push(e.event));
    onFrame(JSON.stringify({ event: "call.incoming" }));
    onFrame(JSON.stringify({ event: "pong" }));
    onFrame("not json");
    onFrame(JSON.stringify({ nothing: true }));
    off();
    expect(seen).toEqual(["call.incoming"]);
  });
  it("delivers a repeated frame with the same id only once", () => {
    const seen: string[] = [];
    const off = subscribeUserEvents((e) => seen.push(e.event));
    onFrame(JSON.stringify({ event: "notification.created", id: "n1" }));
    onFrame(JSON.stringify({ event: "notification.created", id: "n1" }));
    off();
    expect(seen).toEqual(["notification.created"]);
  });
  it("backs off 1s, 2s, 4s, 8s, 16s, then 30s", () => {
    const base = [0, 1, 2, 3, 4, 5, 9].map((n) => Math.floor(backoff(n) / 1000));
    expect(base).toEqual([1, 2, 4, 8, 16, 30, 30]);
    expect(PING_MS).toBe(25_000);
  });
});
