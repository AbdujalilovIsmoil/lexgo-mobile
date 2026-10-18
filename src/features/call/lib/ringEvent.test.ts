import { callIdOf, isOver, parseRing } from "./ringEvent";

const ring = { event: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali", call: { status: "active", call_type: "audio", participants: [] } };

describe("parseRing", () => {
  it("builds the incoming card from a ring frame", () => {
    expect(parseRing(ring, "me")).toEqual({ roomId: "r1", callId: "c1", type: "audio", callerName: "Ali", title: "" });
  });
  it("defaults to video and reads the caller from the host participant", () => {
    const e = { event: "call.invited", room_id: "r", call_id: "c", call: { participants: [{ role: "host", name: "Host" }] } };
    expect(parseRing(e, "me")).toMatchObject({ type: "video", callerName: "Host" });
  });
  it("ignores my own call, ended calls and calls I already handled", () => {
    expect(parseRing({ ...ring, caller_user_id: "me" }, "me")).toBeNull();
    expect(parseRing({ ...ring, call: { status: "ended" } }, "me")).toBeNull();
    expect(parseRing({ ...ring, call: { status: "active", participants: [{ user_id: "me", status: "joined" }] } }, "me")).toBeNull();
    expect(parseRing({ event: "call.incoming" }, "me")).toBeNull();
  });
});

describe("call end detection", () => {
  it("reads the call id from either place", () => {
    expect(callIdOf({ event: "x", call_id: "a" })).toBe("a");
    expect(callIdOf({ event: "x", call: { id: "b" } })).toBe("b");
  });
  it("knows when a call is over", () => {
    expect(isOver({ event: "call.ended" })).toBe(true);
    expect(isOver({ event: "call.updated", status: "cancelled" })).toBe(true);
    expect(isOver({ event: "call.updated", status: "active" })).toBe(false);
  });
});
