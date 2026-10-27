import { http } from "@/shared/api";
import { EMPTY_FILTER } from "../model/types";
import { getStats, listTasks, task } from "./teamTaskApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

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

describe("the period contract (TZ.md task list period)", () => {
  beforeEach(() => mockHttp.mockResolvedValue({ items: [], status_counts: { new: 2, ready: 1 } }));

  it("sends inclusive days with the date they filter on, never the legacy deadline range", async () => {
    const r = await listTasks({ ...EMPTY_FILTER, from: "2026-09-01", to: "2026-09-30", field: "created" }, 30, 0);
    expect(mockHttp).toHaveBeenLastCalledWith("/task-management?date_from=2026-09-01&date_to=2026-09-30&period_field=created&limit=30&offset=0");
    expect(r.counts).toEqual({ new: 2, in_progress: 0, testing: 0, ready: 1 });
  });

  it("takes one day for a range with no end, and sends no period without a start", async () => {
    await listTasks({ ...EMPTY_FILTER, from: "2026-10-27" }, 30, 0);
    expect(mockHttp).toHaveBeenLastCalledWith("/task-management?date_from=2026-10-27&date_to=2026-10-27&period_field=deadline&limit=30&offset=0");
    await listTasks({ ...EMPTY_FILTER, status: "testing" }, 30, 30);
    expect(mockHttp).toHaveBeenLastCalledWith("/task-management?status=testing&limit=30&offset=30");
  });

  it("asks the stats for the day the cards name", async () => {
    await getStats("2026-10-27");
    expect(mockHttp).toHaveBeenLastCalledWith("/task-management/stats?date_from=2026-10-27&date_to=2026-10-27");
  });
});
