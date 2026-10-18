import { http } from "@/shared/api";
import { first, manual, quality, workRef } from "../api/complaintNorm";
import { listMyReviews, listPendingReviews } from "../api/reviewApi";
import { complaintStage, workRefValue } from "../model/complaint";
import { opensComplaint, reviewTargetOf } from "../model/types";
import { complaintMatches, findWorkRef, foldText, isOpaqueRef, matchesRef, sourceRoute, workRoute } from "./complaintText";
import { msLeft, normWindow, windowOpen } from "./window";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("rating window", () => {
  it("reads the nested form (urgent request / document)", () => {
    const w = normWindow({ available: true, submitted: false, deadline_at: "2026-10-18T10:15:00Z", remaining_seconds: 600, value: { rating: 4, comment: "ok" } }, {}, 1000);
    expect(w).toMatchObject({ available: true, submitted: false, remainingSeconds: 600, stars: 4, comment: "ok", fetchedAt: 1000 });
  });
  it("reads the flat rating_* fields", () => {
    const w = normWindow(undefined, { rating_available: true, rating_submitted: true, rating_remaining_seconds: "30", rating: 5 }, 0);
    expect(w).toMatchObject({ available: true, submitted: true, remainingSeconds: 30, stars: 5 });
  });
  it("open = available and not yet submitted, nothing else", () => {
    expect(windowOpen({ available: true, submitted: false } as never)).toBe(true);
    expect(windowOpen({ available: true, submitted: true } as never)).toBe(false);
    expect(windowOpen({ available: false, submitted: false } as never)).toBe(false);
  });
  it("counts down from the server's seconds, never below 0, ignoring the phone's deadline maths", () => {
    const w = normWindow({ available: true, submitted: false, remaining_seconds: 60 }, {}, 1000);
    expect(msLeft(w, 1000)).toBe(60_000);
    expect(msLeft(w, 31_000)).toBe(30_000);
    expect(msLeft(w, 999_999)).toBe(0);
  });
  it("falls back to the deadline only while the window is open", () => {
    const open = normWindow({ available: true, submitted: false, deadline_at: "2026-10-18T10:00:30Z" }, {}, 0);
    expect(msLeft(open, Date.parse("2026-10-18T10:00:00Z"))).toBe(30_000);
    const closed = normWindow({ available: false, submitted: false, deadline_at: "2026-10-18T10:00:30Z" }, {}, 0);
    expect(msLeft(closed, Date.parse("2026-10-18T10:00:00Z"))).toBe(0);
  });
});

describe("opensComplaint / reviewTargetOf", () => {
  it("only 1 and 2 stars open a complaint", () => {
    expect([0, 1, 2, 3, 5].map(opensComplaint)).toEqual([false, true, true, false, false]);
  });
  it("a pending review becomes a window-less rate target", () => {
    const t = reviewTargetOf({ id: "i", caseId: "c", lawyerUserId: "u", lawyerName: "Ali", title: "Nikoh" });
    expect(t).toMatchObject({ kind: "review", recordId: "c", lawyerName: "Ali", title: "Nikoh" });
  });
});

describe("complaint stage", () => {
  it("groups the backend statuses", () => {
    expect(complaintStage("new")).toBe("new");
    expect(complaintStage("rework_required")).toBe("rework");
    expect(complaintStage("rework_in_progress")).toBe("rework");
    expect(complaintStage("resolved")).toBe("resolved");
    expect(complaintStage("rejected")).toBe("rejected");
    expect(complaintStage("cancelled")).toBe("closed");
    expect(complaintStage("in_review")).toBe("review");
    expect(complaintStage("")).toBe("review");
  });
});

describe("complaint normalizers", () => {
  it("manual complaint keeps its payload text and defaults to new", () => {
    const c = manual({ id: "m1", title: "Muammo", payload: { description: " matn ", operator_note: "javob" }, created_at: "2026-10-01" });
    expect(c).toMatchObject({ key: "manual-m1", kind: "manual", subject: "Muammo", description: "matn", operatorNote: "javob", status: "new" });
  });
  it("quality complaint strips the 'Shikoyat:' prefix and knows its source", () => {
    expect(quality({ id: "q", title: "Shikoyat: Sifat", urgent_advokat_request_id: "u1" })).toMatchObject({ kind: "quality", subject: "Sifat", source: "urgent" });
    expect(quality({ id: "q", title: "x", document_request_id: "d" }).source).toBe("document");
    expect(quality({ id: "q", title: "Shikoyat:" }).subject).toBe("Shikoyat:");
  });
  it("first() picks the first non-empty value", () => {
    expect(first("", null, "  a ", "b")).toBe("a");
    expect(first(undefined)).toBe("");
  });
  it("workRef + workRefValue use the case id for legal cases", () => {
    expect(workRefValue(workRef({ id: "1", work_id: "ADV-1", type: "legal_case" }))).toBe("1");
    expect(workRefValue(workRef({ id: "1", work_id: "ADV-1", type: "x" }))).toBe("ADV-1");
  });
});

describe("complaint search and links", () => {
  const c = { id: "ID1", workId: "CMP-1", subject: "O‘zbek tilida", description: "matn", relatedRef: "DOC-9" } as never;
  it("folds apostrophes and case", () => {
    expect(foldText("  O‘ZBEK   TILI ")).toBe("o'zbek tili");
    expect(complaintMatches(c, "o'zbek")).toBe(true);
    expect(complaintMatches(c, "doc-9")).toBe(true);
    expect(complaintMatches(c, "yo'q")).toBe(false);
    expect(complaintMatches(c, "")).toBe(true);
  });
  it("matchesRef is case-insensitive on id or public id and never matches an empty ref", () => {
    expect(matchesRef({ id: "ID1", workId: "CMP-1" }, "cmp-1")).toBe(true);
    expect(matchesRef({ id: "ID1", workId: "CMP-1" }, " ")).toBe(false);
  });
  it("opaque refs are uuids", () => {
    expect(isOpaqueRef("3e3a1b2c-1111-4222-8333-444455556666")).toBe(true);
    expect(isOpaqueRef("ADV-1")).toBe(false);
  });
  it("findWorkRef prefers the exact value, then the id match", () => {
    const list = [{ id: "1", workId: "ADV-1", type: "x", title: "" }, { id: "2", workId: "ADV-2", type: "legal_case", title: "" }];
    expect(findWorkRef(list, "ADV-1")?.id).toBe("1");
    expect(findWorkRef(list, "2")?.id).toBe("2");
    expect(findWorkRef(list, "")).toBeNull();
  });
  it("routes", () => {
    expect(workRoute("x", "A/B")).toBe("/works/A%2FB");
    expect(workRoute("document_lawyer_work", "")).toBe("/documents");
    expect(workRoute("urgent_advokat", "")).toBe("/urgent");
    expect(workRoute("", "")).toBe("/works");
    expect(sourceRoute("document")).toBe("/documents");
    expect(sourceRoute("")).toBe("");
  });
});

describe("review api", () => {
  it("GET /reviews/me maps rating to stars", async () => {
    mockHttp.mockResolvedValueOnce({ items: [{ id: "r", lawyer_name: "Ali", rating: "4", comment: "c", status: "approved", created_at: "d" }] });
    expect(await listMyReviews()).toEqual([{ id: "r", lawyerName: "Ali", stars: 4, comment: "c", status: "approved", createdAt: "d" }]);
    expect(mockHttp).toHaveBeenCalledWith("/reviews/me");
  });
  it("GET /reviews/pending reads ids from the payload too", async () => {
    mockHttp.mockResolvedValueOnce([{ id: "p", payload: { case_id: "c1", lawyer_user_id: "u1", service: "S" }, lawyer_name: "Vali" }]);
    expect(await listPendingReviews()).toEqual([{ id: "p", caseId: "c1", lawyerUserId: "u1", lawyerName: "Vali", title: "S" }]);
  });
});
