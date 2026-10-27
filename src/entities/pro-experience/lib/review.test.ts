import { parseErrorBody } from "@/shared/api/errors";
import { normHistory } from "../api/normHistory";
import { timelineOf } from "./card";
import { experienceErrorOf } from "./errors";
import { isReviewEvent } from "./events";

const rev = (p: Record<string, unknown>) => ({ id: "v1", root_id: "root", version: 1, status: "approved", category_id: "c1", workplace: "Byuro", position: "Advokat", started_at: "2015-01-01T00:00:00Z", submitted_at: "2026-10-01T09:00:00Z", ...p });

describe("experience history (Gaps Closed §3.8)", () => {
  const h = normHistory({
    root_id: "root",
    items: [rev({ id: "v2", version: 2, status: "rejected", position: "Katta advokat", submitted_at: "2026-10-10T09:00:00Z" }), rev({})],
    reviews: [
      { id: "rv1", status: "approved", experience_id: "v1", checklist: { identity_license: "approved", category_test: { verdict: "not_applicable", note: "Test yo'q" } }, reviewed_at: "2026-10-02T09:00:00Z" },
      { id: "rv2", decision: "rejected", experience_id: "v2", reason: "Hujjat o'qilmaydi", checklist: [{ key: "file_authenticity", verdict: "Rejected", note: "Xira" }, { key: "" }], reviewed_by_user_id: "u9", reviewed_at: "2026-10-10T09:00:00Z" },
    ],
    count: 2,
  });
  it("reads the revisions oldest first and the decisions newest first", () => {
    expect(h.rootId).toBe("root");
    expect(h.revisions.map((r) => r.id)).toEqual(["v1", "v2"]);
    expect(h.reviews.map((r) => [r.id, r.decision, r.experienceId])).toEqual([["rv2", "rejected", "v2"], ["rv1", "approved", "v1"]]);
    expect(h.reviews[0]).toMatchObject({ reason: "Hujjat o'qilmaydi", checklist: [{ key: "file_authenticity", verdict: "rejected", note: "Xira" }] });
    expect(h.reviews[1].checklist).toEqual([{ key: "identity_license", verdict: "approved", note: "" }, { key: "category_test", verdict: "not_applicable", note: "Test yo'q" }]);
  });
  it("makes one timeline: a decision in the same second as its submission comes after it", () => {
    const tl = timelineOf(h);
    expect(tl.map((e) => e.key)).toEqual(["r:rv2", "s:v2", "r:rv1", "s:v1"]);
    expect(tl[0]).toMatchObject({ kind: "review", version: 2 });
    expect(tl[1]).toMatchObject({ kind: "sent", changed: ["position"] });
    expect(tl[3]).toMatchObject({ kind: "sent", changed: [] });
  });
  it("takes the decisions from the revisions when the answer has no reviews", () => {
    const old = normHistory({ items: [rev({ reviewed_at: "2026-10-02T09:00:00Z", checklist: [{ key: "dates_duration", verdict: "approved" }] }), rev({ id: "v2", version: 2, status: "rejected", rejection_reason: "Sana noto'g'ri", reviewed_at: "2026-10-11T00:00:00Z" }), rev({ id: "v3", version: 3, status: "pending_review" })] });
    expect(old.rootId).toBe("root");
    expect(old.reviews.map((r) => [r.experienceId, r.decision, r.reason])).toEqual([["v2", "rejected", "Sana noto'g'ri"], ["v1", "approved", ""]]);
    expect(normHistory({})).toEqual({ rootId: "", revisions: [], reviews: [] });
  });
});

describe("experience submission errors (Gaps Closed §3.12)", () => {
  const err = (detail: unknown, status = 422) => experienceErrorOf(parseErrorBody(status, { detail }));
  it("points every code at its input", () => {
    expect(err({ code: "experience_dates_invalid", field: "ended_at" })).toEqual({ code: "experience_dates_invalid", slots: ["ended"], conflictId: "", values: [], allowed: [] });
    expect(err({ code: "experience_future_date", field: "started_at" })?.slots).toEqual(["started"]);
    expect(err({ code: "experience_category_invalid", field: "category_id" })?.slots).toEqual(["category"]);
    expect(err({ code: "experience_subcategory_invalid", field: "subcategory_id" })?.slots).toEqual(["subcategory"]);
    expect(err({ code: "experience_fields_required", fields: ["category_id", "workplace"] })?.slots).toEqual(["category", "workplace"]);
  });
  it("keeps the overlapping entry and the refused values", () => {
    expect(err({ code: "experience_dates_overlap", field: "started_at", conflicting_experience_id: "e7" })).toMatchObject({ slots: ["started"], conflictId: "e7" });
    expect(err({ code: "experience_stage_invalid", field: "stages", values: ["court"], allowed: ["investigation", "appeal"] })).toMatchObject({ slots: ["stages"], values: ["court"], allowed: ["investigation", "appeal"] });
    expect(err({ code: "experience_result_invalid", values: ["won"] })).toMatchObject({ slots: ["results"], values: ["won"] }); // no field: the code decides
  });
  it("leaves a code without an input for the top of the form, and ignores other errors", () => {
    expect(err({ code: "experience_revision_already_pending", source_id: "a" }, 409)).toMatchObject({ code: "experience_revision_already_pending", slots: [] });
    expect(err([{ loc: ["body", "started_at"], msg: "invalid datetime" }])).toMatchObject({ code: "", slots: ["started"] }); // FastAPI 422
    expect(err({ code: "order_not_found" }, 404)).toBeNull();
    expect(err("Internal error", 500)).toBeNull();
    expect(experienceErrorOf(new Error("x"))).toBeNull();
  });
});

describe("experience review event (Gaps Closed §3.13)", () => {
  it("is the socket event or a notification of it", () => {
    expect(isReviewEvent({ event: "marketplace.experience_reviewed", experience_id: "e1", decision: "approved" })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", notification: { data: { event: "marketplace.experience_reviewed" } } })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", notification: { type: "marketplace_experience_reviewed" } })).toBe(true);
    expect(isReviewEvent({ event: "notification.created", data: { event: "marketplace.experience_reviewed" } })).toBe(true); // the row's fields on the frame
    expect(isReviewEvent({ event: "notification.created", notification: { data: { event: "marketplace.order_paid" } } })).toBe(false);
    expect(isReviewEvent({ event: "marketplace.assignment_received" })).toBe(false);
  });
});
