import { task } from "./teamTaskApi";

const sample = {
  id: "t1", task_code: "TSK-210740", title: "Production deploy", description: "Deploy and test", status: "in_progress", deadline_at: "2026-10-21T12:00:00+00:00", is_overdue: false,
  creator: { id: "u1", name: "Akhmad", lexgo_id: "LGC-1" }, assignees: [{ id: "u2", name: "Kamron", lexgo_id: "LGC-2", role: "client" }], ready_by: null, lock_version: 2,
  updated_at: "2026-10-20T10:05:00+00:00", deleted_at: null, delete_reason: "",
  actions: { can_edit: false, can_assign: false, can_delete: false, can_change_status: true, next_statuses: ["testing"], is_assigned: true },
};

describe("a task from the API", () => {
  it("keeps the code, the lock version and what the server allows", () => {
    const t = task(sample);
    expect(t).toMatchObject({ id: "t1", code: "TSK-210740", status: "in_progress", lockVersion: 2, overdue: false });
    expect(t.actions).toEqual({ canEdit: false, canAssign: false, canDelete: false, canChangeStatus: true, next: ["testing"], isAssigned: true });
    expect(t.assignees.map((p) => p.name)).toEqual(["Kamron"]);
  });
  it("an unknown status falls back to new, a task without actions allows nothing", () => {
    const t = task({ id: "t2", status: "weird" });
    expect(t.status).toBe("new");
    expect(t.actions.canChangeStatus).toBe(false);
    expect(t.actions.next).toEqual([]);
  });
});
