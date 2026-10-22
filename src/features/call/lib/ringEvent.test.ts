import { callIdOf, isOver, parseRing, ringable, ringFrameOf, ringSkip } from "./ringEvent";

const ring = { event: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali", call: { status: "active", call_type: "audio", participants: [] } };

describe("parseRing", () => {
  it("builds the incoming card from a ring frame", () => {
    expect(parseRing(ring, "me")).toEqual({ roomId: "r1", callId: "c1", type: "audio", callerName: "Ali", title: "" });
  });
  it("defaults to video and reads the caller from the host participant", () => {
    const e = { event: "call.invited", room_id: "r", call_id: "c", call: { participants: [{ role: "host", name: "Host" }] } };
    expect(parseRing(e, "me")).toMatchObject({ type: "video", callerName: "Host" });
  });
  it("a flat frame (the push's shape) rings too, with its own call type", () => {
    const e = { event: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali", caller_user_id: "u2", call_type: "audio" };
    expect(parseRing(e, "me")).toEqual({ roomId: "r1", callId: "c1", type: "audio", callerName: "Ali", title: "" });
  });
  it("a call that is still ringing (any state but a finished one) rings — an unknown state must not silence a real call", () => {
    expect(parseRing({ ...ring, call: { ...ring.call, status: "ringing" } }, "me")).not.toBeNull();
    expect(parseRing({ ...ring, call: { ...ring.call, status: "initiated" } }, "me")).not.toBeNull();
  });
  it("ignores my own call, ended calls and calls I already handled", () => {
    expect(parseRing({ ...ring, caller_user_id: "me" }, "me")).toBeNull();
    expect(parseRing({ ...ring, call: { status: "ended" } }, "me")).toBeNull();
    expect(parseRing({ ...ring, call: { status: "expired" } }, "me")).toBeNull();
    expect(parseRing({ ...ring, call: { status: "active", participants: [{ user_id: "me", status: "joined" }] } }, "me")).toBeNull();
    expect(parseRing({ event: "call.incoming" }, "me")).toBeNull();
  });
});

describe("ringSkip", () => {
  it("says why a frame does not ring (for the connection journal)", () => {
    expect(ringSkip(ring, "me")).toBe("");
    expect(ringSkip({ ...ring, caller_user_id: "me" }, "me")).toBe("my own call");
    expect(ringSkip({ ...ring, call: { status: "ended" } }, "me")).toBe("call ended");
    expect(ringSkip({ ...ring, call: { status: "active", participants: [{ user_id: "me", status: "declined" }] } }, "me")).toBe("me declined");
    expect(ringSkip({ event: "call.incoming" }, "me")).toBe("no room/call id");
  });
});

describe("ringable", () => {
  it("only a finished call or a meeting set for later does not ring", () => {
    expect(ringable("active")).toBe(true);
    expect(ringable("ringing")).toBe(true);
    expect(ringable("")).toBe(true);
    expect(ringable("scheduled")).toBe(false);
    for (const s of ["ended", "cancelled", "expired", "missed", "declined", "ENDED"]) expect(ringable(s)).toBe(false);
  });
});

describe("ringFrameOf", () => {
  it("takes a bare ring as it is", () => {
    expect(ringFrameOf(ring)).toBe(ring);
  });
  it("unwraps a ring that came inside notification.created", () => {
    const wrapped = { event: "notification.created", notification: { id: "n1", data: { event: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali" } } };
    expect(ringFrameOf(wrapped)).toEqual({ event: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali" });
    expect(parseRing(ringFrameOf(wrapped)!, "me")).toMatchObject({ roomId: "r1", callId: "c1" });
  });
  it("other frames are not rings", () => {
    expect(ringFrameOf({ event: "notification.created", notification: { data: { event: "secure_chat.message_created" } } })).toBeNull();
    expect(ringFrameOf({ event: "call.ended", call_id: "c1" })).toBeNull();
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
    expect(isOver({ event: "call.updated", call_status: "expired" })).toBe(true);
    expect(isOver({ event: "call.updated", status: "active" })).toBe(false);
  });
  it("another participant declining does not stop my ring", () => {
    expect(isOver({ event: "call.participant_updated", call_id: "c1", user_id: "someone", status: "declined" })).toBe(false);
  });
});
