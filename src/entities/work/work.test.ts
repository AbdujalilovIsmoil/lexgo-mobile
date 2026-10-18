import { inGroup, filterWorks, haystack, matchesQuery } from "@/features/work-filters/model/match";
import { http } from "@/shared/api";
import { fetchWorksPage } from "./api/worksApi";
import { normPerson, normWork } from "./api/normWork";
import { isOpenWork, workGroup, workTone } from "./model/group";
import { workKind } from "./model/kind";
import type { Work } from "./model/types";
import { whenText } from "./lib/when";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;
const w = (p: Partial<Work>): Work => ({ id: "1", workId: "ADV-1", type: "x", kind: "other", title: "T", status: "new", statusLabel: "", serviceKind: "", assignee: null, operator: null, hasChat: false, hasMeeting: false, nextAction: "", documentRequestId: "", createdAt: "", updatedAt: "", ...p });

describe("workKind", () => {
  it("one kind for both complaint types, other for the unknown", () => {
    expect(workKind("document_lawyer_work")).toBe("document");
    expect(workKind("urgent_advokat")).toBe("urgent");
    expect(workKind("service_order")).toBe("order");
    expect(workKind("legal_case")).toBe("case");
    expect(workKind("quality_complaint")).toBe("complaint");
    expect(workKind(" Complaint ")).toBe("complaint");
    expect(workKind("whatever")).toBe("other");
  });
});

describe("workGroup / workTone", () => {
  it("buckets statuses; an unknown one is simply active", () => {
    expect(workGroup("pending_payment")).toBe("queue");
    expect(workGroup("lawyer_review")).toBe("review");
    expect(workGroup("file_ready")).toBe("done");
    expect(workGroup("payment_rejected")).toBe("closed");
    expect(workGroup("in_progress")).toBe("active");
    expect(workGroup(" COMPLETED ")).toBe("done");
  });
  it("open = queue + active + review", () => {
    expect([isOpenWork("new"), isOpenWork("started"), isOpenWork("result_ready"), isOpenWork("closed")]).toEqual([true, true, true, false]);
  });
  it("tones: bad outcomes are red, waiting is warm, finished is green", () => {
    expect(workTone("rejected")).toBe("err");
    expect(workTone("new")).toBe("warn");
    expect(workTone("quality_check")).toBe("cy");
    expect(workTone("done")).toBe("ok");
    expect(workTone("archived")).toBe("gray");
    expect(workTone("in_progress")).toBe("blue");
  });
});

describe("normWork / normPerson", () => {
  it("reads a row and keeps only name and role of people (no phones)", () => {
    const x = normWork({ id: "u", work_id: "ADV-9", type: "urgent_advokat", document_title: "Shartnoma", status: "IN_REVIEW", assigned_lawyer: { name: "Ali", role: "Advokat", phone: "+998" }, has_chat: 1 });
    expect(x).toMatchObject({ kind: "urgent", title: "Shartnoma", status: "in_review", hasChat: true });
    expect(x.assignee).toEqual({ name: "Ali", role: "advokat" });
    expect(JSON.stringify(x)).not.toContain("+998");
  });
  it("joins first and last name, and a nameless person is nobody", () => {
    expect(normPerson({ first_name: "Vali", last_name: "Aliyev" })).toEqual({ name: "Vali Aliyev", role: "" });
    expect(normPerson({ phone: "+998" })).toBeNull();
    expect(normPerson(null)).toBeNull();
  });
});

describe("fetchWorksPage", () => {
  it("pages by 100 and keeps the server's total", async () => {
    mockHttp.mockResolvedValueOnce({ items: [{ id: "a" }], total: 250 });
    const page = await fetchWorksPage(100);
    expect(mockHttp).toHaveBeenCalledWith("/clients/me/works?limit=100&offset=100");
    expect(page).toMatchObject({ total: 250 });
    expect(page.items).toHaveLength(1);
    mockHttp.mockResolvedValueOnce({ items: [{ id: "a" }, { id: "b" }] });
    expect((await fetchWorksPage(0)).total).toBe(2);
  });
});

describe("work filters", () => {
  const list = [w({ id: "1", status: "new", kind: "document", title: "Nikoh shartnomasi" }), w({ id: "2", status: "done", kind: "urgent", title: "Tezkor", assignee: { name: "Ali Valiyev", role: "" } }), w({ id: "3", status: "cancelled", kind: "document", title: "Meros" })];
  const hays = new Map(list.map((x) => [x.id, haystack(x, "")]));
  it("group filter: open is queue+active+review", () => {
    expect(list.filter((x) => inGroup(x, "open")).map((x) => x.id)).toEqual(["1"]);
    expect(list.filter((x) => inGroup(x, "done")).map((x) => x.id)).toEqual(["2"]);
    expect(list.filter((x) => inGroup(x, "all"))).toHaveLength(3);
  });
  it("search is accent / apostrophe tolerant, every word must match, and includes the lawyer", () => {
    expect(matchesQuery(haystack(list[0], ""), "NIKOH shart")).toBe(true);
    expect(matchesQuery(haystack(list[1], ""), "ali valiyev")).toBe(true);
    expect(matchesQuery(haystack(list[0], ""), "nikoh meros")).toBe(false);
    expect(matchesQuery(haystack(w({ title: "O'zbek tili" }), ""), "ozbek")).toBe(true);
  });
  it("facets: counting a dimension ignores its own filter", () => {
    const f = { q: "", kind: "urgent" as const, group: "all" as const };
    expect(filterWorks(list, f, hays).map((x) => x.id)).toEqual(["2"]);
    expect(filterWorks(list, f, hays, "kind")).toHaveLength(3);
    expect(filterWorks(list, { ...f, kind: "all", q: "meros" }, hays).map((x) => x.id)).toEqual(["3"]);
  });
});

describe("whenText", () => {
  const t = (k: string, p?: Record<string, string | number>) => (p ? `${k}:${p.n}` : k);
  it("relative within a week, a date after, empty for nothing", () => {
    expect(whenText(new Date(Date.now() - 5 * 60_000).toISOString(), t, "uz")).toBe("admSt.ago.min:5");
    expect(whenText("2020-01-05T00:00:00Z", t, "uz")).not.toContain("admSt");
    expect(whenText("", t, "uz")).toBe("");
  });
});
