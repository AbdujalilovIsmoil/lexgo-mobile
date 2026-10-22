import { dedupeKey, remoteDataOf } from "./remoteData";

describe("remoteDataOf", () => {
  it("reads the data bag, a notification response and JSON-encoded FCM data", () => {
    expect(remoteDataOf({ data: { type: "call.ended", call_id: "c1" } })).toEqual({ type: "call.ended", callId: "c1", taskId: "" });
    expect(remoteDataOf({ notification: { request: { content: { data: { type: "tasks.assigned", task_id: "t1", task_code: "TSK-1" } } } } })).toEqual({ type: "tasks.assigned", callId: "", taskId: "t1" });
    expect(remoteDataOf({ data: { dataString: JSON.stringify({ type: "call.incoming", call_id: "c2" }) } }).callId).toBe("c2");
    expect(remoteDataOf({ type: "tasks.returned", task_id: "t2" }).taskId).toBe("t2");
  });
  it("a local alert's `event` counts as the type; garbage reads as empty", () => {
    expect(remoteDataOf({ request: { content: { data: { event: "tasks.returned", task_id: "t3" } } } })).toEqual({ type: "tasks.returned", callId: "", taskId: "t3" });
    expect(remoteDataOf(null)).toEqual({ type: "", callId: "", taskId: "" });
    expect(remoteDataOf({ data: { dataString: "{not json" } }).type).toBe("");
  });
});

describe("dedupeKey", () => {
  it("is type + call_id for calls and type + task_id for tasks", () => {
    expect(dedupeKey({ type: "call.incoming", callId: "c1", taskId: "" })).toBe("call.incoming:c1");
    expect(dedupeKey({ type: "tasks.assigned", callId: "", taskId: "t1" })).toBe("tasks.assigned:t1");
    expect(dedupeKey({ type: "x", callId: "", taskId: "" })).toBe("");
  });
});
