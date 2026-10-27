import { dedupeKey, remoteDataOf, type RemoteData } from "./remoteData";

const empty: RemoteData = { type: "", callId: "", taskId: "", roomId: "", callerName: "", callerId: "", callType: "", sessionId: "", action: "" };

describe("remoteDataOf", () => {
  it("reads the data bag, a notification response and JSON-encoded FCM data", () => {
    expect(remoteDataOf({ data: { type: "call.ended", call_id: "c1" } })).toMatchObject({ type: "call.ended", callId: "c1", taskId: "" });
    expect(remoteDataOf({ notification: { request: { content: { data: { type: "tasks.assigned", task_id: "t1", task_code: "TSK-1" } } } } })).toMatchObject({ type: "tasks.assigned", callId: "", taskId: "t1" });
    expect(remoteDataOf({ data: { dataString: JSON.stringify({ type: "call.incoming", call_id: "c2" }) } }).callId).toBe("c2");
    expect(remoteDataOf({ type: "tasks.returned", task_id: "t2" }).taskId).toBe("t2");
  });
  it("a call push carries everything the ring needs", () => {
    const d = remoteDataOf({ data: { type: "call.incoming", room_id: "r1", call_id: "c1", caller_name: "Ali", caller_user_id: "u9", call_type: "audio" } });
    expect(d).toEqual({ ...empty, type: "call.incoming", roomId: "r1", callId: "c1", callerName: "Ali", callerId: "u9", callType: "audio" });
  });
  it("a notification button pressed while the app is not open is the response's action", () => {
    const d = remoteDataOf({ actionIdentifier: "decline", notification: { request: { content: { data: { event: "call.incoming", room_id: "r1", call_id: "c1" } } } } });
    expect(d).toMatchObject({ action: "decline", type: "call.incoming", roomId: "r1", callId: "c1" });
  });
  it("a remote-assistance request carries its session id", () => {
    expect(remoteDataOf({ data: { type: "remote_assist.requested", session_id: "s1" } })).toMatchObject({ type: "remote_assist.requested", sessionId: "s1" });
  });
  it("a local alert's `event` counts as the type; garbage reads as empty", () => {
    expect(remoteDataOf({ request: { content: { data: { event: "tasks.returned", task_id: "t3" } } } })).toMatchObject({ type: "tasks.returned", callId: "", taskId: "t3" });
    expect(remoteDataOf(null)).toEqual(empty);
    expect(remoteDataOf({ data: { dataString: "{not json" } }).type).toBe("");
  });
});

describe("dedupeKey", () => {
  it("is type + call_id for calls and type + task_id for tasks", () => {
    expect(dedupeKey({ ...empty, type: "call.incoming", callId: "c1" })).toBe("call.incoming:c1");
    expect(dedupeKey({ ...empty, type: "tasks.assigned", taskId: "t1" })).toBe("tasks.assigned:t1");
    expect(dedupeKey({ ...empty, type: "x" })).toBe("");
  });
});
