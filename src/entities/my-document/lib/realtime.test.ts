import { docEventOf } from "./realtime";

describe("docEventOf", () => {
  it("matches a record by document_request_id or record_id", () => {
    expect(docEventOf({ event: "document_request.claimed", document_request_id: "d1" })?.ids).toEqual(["d1"]);
    expect(docEventOf({ event: "document_request.claimed", record_id: "r9" })?.ids).toEqual(["r9"]);
  });
  it("knows the README's events: transferred, draft / editor saved and ready are all about documents", () => {
    for (const name of ["document_request.sent", "document_request.payment_required", "document_request.payment_rejected", "document_request.claimed", "document_request.transferred", "document_request.draft_saved", "document_request.editor_saved", "document_request.meeting_created", "document_request.ready"]) {
      expect(docEventOf({ event: name, document_request_id: "d1" })).not.toBeNull();
    }
    expect(docEventOf({ event: "document_request.ready" })?.kind).toBe("ready");
    expect(docEventOf({ event: "document_request.transferred" })?.kind).toBe("changed");
  });
  it("reads the constructor continue prompt", () => {
    expect(docEventOf({ event: "document_constructor_continue_prompt", document_request_id: "d1" })).toMatchObject({ kind: "prompt", ids: ["d1"] });
  });
  it("reads a wrapped notification and the event's own identity", () => {
    const ev = docEventOf({ event: "notification.created", notification: { id: "n1", data: { event: "document_request.ready", document_request_id: "d2" } } });
    expect(ev).toMatchObject({ kind: "ready", ids: ["d2"], uid: "n1" });
    expect(docEventOf({ event: "document_request.ready", event_id: "e7", document_request_id: "d2" })?.uid).toBe("e7");
  });
  it("a plain id is the record's, not the event's identity", () => {
    expect(docEventOf({ event: "document_request.claimed", id: "d1", document_request_id: "d1" })?.uid).toBe("");
  });
  it("ignores everything else", () => {
    expect(docEventOf({ event: "call.incoming" })).toBeNull();
  });
});
