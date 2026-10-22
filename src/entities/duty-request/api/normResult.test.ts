import { normResult } from "./normResult";

describe("normResult constructor action", () => {
  it("reads the continuation question next to the request", () => {
    const r = normResult({ request: { id: "d1", work_id: "W-1", status: "open_pool" }, assignment_mode: "callcenter_pool", assigned_lawyer: null, constructor_action: { available: true, prompt_required: true, title: "Ishingiz berildi", message: "Davom ettirasizmi?" } });
    expect(r).toMatchObject({ docId: "d1", created: true, ctor: { available: true, promptRequired: true, title: "Ishingiz berildi", message: "Davom ettirasizmi?" } });
  });
  it("has none when the backend sends none", () => {
    expect(normResult({ request: { id: "d1" } }).ctor).toBeNull();
  });
});
