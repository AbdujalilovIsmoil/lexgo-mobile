import { http } from "@/shared/api";
import { parseErrorBody } from "@/shared/api/errors";
import { listMyAchievements, listPublicAchievements, submitAchievement, submissionBody } from "../api/achApi";
import { normAchievement, normEvidence, normPage, normPublic } from "../api/norm";
import { ACH_TYPES } from "../model/types";
import { achievementErrorOf } from "./errors";
import { isReviewEvent } from "./events";
import { typeLabel } from "./labels";
import { achIssues, evidenceProblem } from "./validate";

jest.mock("expo-document-picker", () => ({}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-file-system", () => ({ File: class {}, Directory: class {}, Paths: {} }));
jest.mock("@/shared/api",() => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;
beforeEach(() => mockHttp.mockReset());

const row = (p: Record<string, unknown> = {}) => ({ id: "a1", achievement_type: "pro_bono", title: " Bepul maslahat ", achieved_at: "2026-09-01", description: "x", status: "approved", ...p });

describe("achievement rows", () => {
  it("reads a row and its status", () => {
    expect(normAchievement(row({ category_id: "c1", category_name: "Mehnat" }))).toMatchObject({ id: "a1", type: "pro_bono", title: "Bepul maslahat", achievedAt: "2026-09-01", status: "approved", categoryId: "c1", categoryName: "Mehnat" });
    expect(normAchievement(row({ status: "pending" }))?.status).toBe("pending_review");
    expect(normAchievement(row({ status: "pending_review" }))?.status).toBe("pending_review");
    expect(normAchievement(row({ status: "changes_requested", reason: "Hujjat yo'q" }))).toMatchObject({ status: "other", rejectionReason: "Hujjat yo'q" });
    expect(normAchievement(row({ status: "rejected", rejection_reason: "Soxta" }))).toMatchObject({ status: "rejected", rejectionReason: "Soxta" });
    expect(normAchievement({ title: "no id" })).toBeNull();
    expect(normAchievement(null)).toBeNull();
  });
  it("takes the category name from a string or an object, and the date without its time", () => {
    expect(normAchievement(row({ category: { title: "Soliq" }, achieved_at: "2026-09-01T00:00:00Z" }))).toMatchObject({ categoryName: "Soliq", achievedAt: "2026-09-01" });
    expect(normAchievement(row({ category: "Jinoiy" }))?.categoryName).toBe("Jinoiy");
  });
  it("keeps every evidence file once: objects, bare ids and evidence_ids", () => {
    const r = normAchievement(row({ evidence: [{ id: "e1", file_name: "diplom.pdf", mime_type: "application/pdf", size: 10, download_url: "/d/e1" }, "e2"], evidence_ids: ["e1", "e3"] }))!;
    expect(r.evidence.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
    expect(r.evidence[0]).toEqual({ id: "e1", fileName: "diplom.pdf", mime: "application/pdf", size: 10, downloadUrl: "/d/e1" });
    expect(normEvidence({ id: "a b" }).downloadUrl).toBe("/marketplace/experience/evidence/a%20b");
    expect(normEvidence({ name: "no id" }).id).toBe("");
  });
  it("the public row keeps only the safe fields", () => {
    const p = normPublic({ id: "p1", achievement_type: "award_recognition", title: "Yilning advokati", achieved_at: "2026-01-05", category_name: "Sud", description: "secret", evidence_ids: ["e"], operator_note: "x", client_name: "Ali" }, 0)!;
    expect(p).toEqual({ key: "p1", type: "award_recognition", title: "Yilning advokati", achievedAt: "2026-01-05", categoryName: "Sud" });
    expect(normPublic({ title: " " }, 0)).toBeNull();
    expect(normPublic({ title: "T" }, 3)?.key).toBe("p3");
  });
});

describe("paging", () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => row({ id: `a${i}` }));
  it("continues while the total says there is more", () => {
    expect(normPage({ items: rows(10), total: 25, count: 10, limit: 10, offset: 0 }, 0, 10, normAchievement)).toMatchObject({ total: 25, next: 10 });
    expect(normPage({ items: rows(5), total: 25, offset: 20 }, 20, 10, normAchievement).next).toBeNull();
  });
  it("an empty list (the live sample) ends at once", () => {
    expect(normPage({ items: [], total: 0, count: 0, limit: 20, offset: 0 }, 0, 10, normAchievement)).toEqual({ items: [], total: 0, next: null });
    expect(normPage(null, 0, 10, normAchievement)).toEqual({ items: [], total: 0, next: null });
  });
  it("falls back to has_more, then to a full page", () => {
    expect(normPage({ items: rows(3), has_more: true }, 0, 10, normAchievement).next).toBe(3);
    expect(normPage({ items: rows(10) }, 0, 10, normAchievement).next).toBe(10);
    expect(normPage(rows(2), 0, 10, normAchievement).next).toBeNull();
  });
  it("asks for ten at a time from the right endpoints", async () => {
    mockHttp.mockResolvedValueOnce({ items: [], total: 0 });
    await listMyAchievements(20);
    expect(mockHttp).toHaveBeenLastCalledWith("/marketplace/me/achievements?limit=10&offset=20");
    mockHttp.mockResolvedValueOnce({ items: [{ title: "T" }], total: 1 });
    expect((await listPublicAchievements("u/1", 0)).items).toHaveLength(1);
    expect(mockHttp).toHaveBeenLastCalledWith("/marketplace/lawyers/u%2F1/achievements?limit=10&offset=0");
  });
});

describe("submission", () => {
  const input = { type: "tax_customs" as const, title: "  Soliq nizosi  ", categoryId: "", achievedOn: "2026-09-01", description: " Yutib oldim ", evidenceIds: ["e1", "e2"] };
  it("builds the AchievementSubmission body, trimmed, without an empty category", () => {
    expect(submissionBody(input)).toEqual({ achievement_type: "tax_customs", title: "Soliq nizosi", achieved_at: "2026-09-01", description: "Yutib oldim", evidence_ids: ["e1", "e2"] });
    expect(submissionBody({ ...input, categoryId: "c9" })).toMatchObject({ category_id: "c9" });
  });
  it("POSTs it to /marketplace/me/achievements", async () => {
    mockHttp.mockResolvedValueOnce(row({ status: "pending_review" }));
    const r = await submitAchievement({ ...input, categoryId: "c9" });
    expect(mockHttp).toHaveBeenCalledWith("/marketplace/me/achievements", { method: "POST", body: expect.objectContaining({ achievement_type: "tax_customs", category_id: "c9", evidence_ids: ["e1", "e2"] }) });
    expect(r?.status).toBe("pending_review");
  });
});

describe("checks before sending", () => {
  const ok = { type: "other" as const, title: "Ok", categoryId: "", achievedOn: "2026-09-01", description: "12345", evidenceIds: [] };
  it("passes the contract's minimums", () => expect(achIssues(ok, "2026-10-27")).toEqual([]));
  it("flags each input outside its limits", () => {
    expect(achIssues({ ...ok, type: "", title: "A", achievedOn: "", description: "1234" }, "2026-10-27")).toEqual(["type", "title", "date", "description"]);
    expect(achIssues({ ...ok, achievedOn: "2026-11-01" }, "2026-10-27")).toEqual(["date"]);
    expect(achIssues({ ...ok, title: "x".repeat(256), description: "y".repeat(5001) }, "2026-10-27")).toEqual(["title", "description"]);
    expect(achIssues({ ...ok, title: " a " }, "2026-10-27")).toEqual(["title"]);
    expect(achIssues({ ...ok, evidenceIds: Array.from({ length: 21 }, (_, i) => `e${i}`) }, "2026-10-27")).toEqual(["files"]);
  });
  it("knows the 14 types", () => expect(new Set(ACH_TYPES).size).toBe(14));
});

describe("evidence file check", () => {
  const MB = 1024 * 1024;
  it("accepts PDF, DOC, DOCX, JPEG, PNG and WebP up to 20 MB", () => {
    for (const n of ["a.pdf", "a.DOC", "a.docx", "a.jpg", "a.jpeg", "a.PNG", "a.webp"]) expect(evidenceProblem({ name: n, size: 20 * MB })).toBeNull();
  });
  it("refuses other types and anything over 20 MB", () => {
    for (const n of ["a.gif", "a.heic", "a.exe", "a.txt", "pdf"]) expect(evidenceProblem({ name: n, size: 1 })).toBe("badType");
    expect(evidenceProblem({ name: "a.pdf", size: 20 * MB + 1 })).toBe("tooBig");
  });
});

describe("server errors and the review event", () => {
  const err = (detail: unknown, status = 422) => achievementErrorOf(parseErrorBody(status, { detail }));
  it("points a 422 at its inputs", () => {
    expect(err([{ loc: ["body", "title"], msg: "too short" }, { loc: ["body", "achieved_at"], msg: "bad date" }])).toEqual({ code: "", slots: ["title", "date"], message: "too short" });
    expect(err({ code: "achievement_category_invalid", field: "category_id" })).toMatchObject({ code: "achievement_category_invalid", slots: ["category"] });
  });
  it("leaves what names no input for the top of the form", () => {
    expect(err("Internal error", 500)).toBeNull();
    expect(err({ code: "marketplace_seller_unavailable" }, 403)).toBeNull();
    expect(achievementErrorOf(new Error("x"))).toBeNull();
  });
  it("is the socket event (both spellings) or a notification of it", () => {
    expect(isReviewEvent({ event: "marketplace.achievement_reviewed" })).toBe(true);
    expect(isReviewEvent({ event: "marketplace_achievement_reviewed" })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", notification: { data: { event: "marketplace.achievement_reviewed" } } })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", notification: { type: "marketplace_achievement_reviewed" } })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", data: { event: "marketplace.achievement_reviewed" } })).toBe(true);
    expect(isReviewEvent({ event: "marketplace.experience_reviewed" })).toBe(false);
    expect(isReviewEvent({ event: "notification.created", notification: { data: { event: "marketplace.order_paid" } } })).toBe(false);
  });
  it("labels a known type and shows an unknown one as written", () => {
    const t = (k: string) => `T:${k}`;
    expect(typeLabel("pro_bono", t)).toBe("T:ach.type.pro_bono");
    expect(typeLabel("new_kind", t)).toBe("New kind");
    expect(typeLabel("", t)).toBe("");
  });
});
