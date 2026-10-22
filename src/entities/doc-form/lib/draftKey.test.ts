import { draftKey, useDraftStore } from "../model/draftStore";

beforeEach(() => useDraftStore.getState().clear());

describe("template drafts", () => {
  it("are keyed by user, mode and template", () => {
    expect(draftKey("u1", "tpl", "t1")).toBe("u1:tpl:t1");
    expect(draftKey("u1", "manual", "s1")).toBe("u1:manual:s1");
  });
  it("a draft that holds only the request id is kept (so the same request is resumed), an empty one is not", () => {
    const { save } = useDraftStore.getState();
    save("u1:tpl:t1", { answers: {}, step: 0, requestId: "r1" });
    save("u1:tpl:t2", { answers: { a: " " }, step: 0 });
    const d = useDraftStore.getState().drafts;
    expect(d["u1:tpl:t1"]?.requestId).toBe("r1");
    expect(d["u1:tpl:t2"]).toBeUndefined();
  });
  it("keeps the request id together with the typed answers", () => {
    useDraftStore.getState().save("u1:tpl:t1", { answers: { a: "x" }, step: 2, requestId: "r9" });
    expect(useDraftStore.getState().drafts["u1:tpl:t1"]).toMatchObject({ answers: { a: "x" }, step: 2, requestId: "r9" });
  });
});
