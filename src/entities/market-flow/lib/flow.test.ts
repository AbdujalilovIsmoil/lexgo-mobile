import { ApiError } from "@/shared/api";
import { normCaps, normChecklist, normFinancials, normFlow, normTimeline, payKindOf } from "../api/norm";
import { blockingItems, codeOf, flowErrorKey, needsRefetch } from "./codes";
import { callTypesOf, chatModeOf, phaseOf } from "./phase";
import { answerState, clock, complaintState, msUntil } from "./window";

// Shapes taken from GET /marketplace/me/orders/{id} (2026-10-24), personal data left out.
const PAID = {
  id: "o1", status: "paid", payment_status: "paid", can_start_chat: true, can_create_call: true, can_start: false, can_complete: false,
  contact_unlocked: true, chat_read_only: false, calls_enabled: true, allowed_call_types: ["audio", "video"],
  actions: { start: null, checklist: "/marketplace/orders/o1/checklist", complete: null },
  start_url: null, checklist_url: "/marketplace/orders/o1/checklist", complete_url: null, started_at: null, expected_completed_at: null,
  rating: { available: false, closed: true, reason: "status_not_rateable", deadline_at: null, remaining_seconds: 0 },
  complaint: { available: false, deadline_at: null, submitted: false, complaint_id: null, url: null },
  financials_url: "/marketplace/me/orders/o1/financials", warranty_url: "/marketplace/me/orders/o1/warranty",
  details: { financial_snapshot: { gross_amount: 525000, payment: { advance_percent: 10, advance_amount: 52500, final_percent: 90, final_amount: 472500, provider_enabled: false } } },
};

describe("normFlow", () => {
  it("reads gates, urls and the payment plan from a paid order", () => {
    const f = normFlow(PAID);
    expect(f.contactUnlocked).toBe(true);
    expect(f.chatReadOnly).toBe(false);
    expect(f.callTypes).toEqual(["audio", "video"]);
    expect(f.canStart).toBe(false);
    expect(f.checklistUrl).toBe("/marketplace/orders/o1/checklist");
    expect(f.warrantyUrl).toBe("/marketplace/me/orders/o1/warranty");
    expect(f.advance).toEqual({ percent: 10, amount: 52500 });
    expect(f.final).toEqual({ percent: 90, amount: 472500 });
    expect(f.finalPayment).toBeNull();
    expect(f.complaint).toEqual({ available: false, deadlineAt: "", submitted: false, id: "", url: "", status: "" });
  });
  it("narrows calls to the allowed types and reads an assignment deadline and the final payment", () => {
    const f = normFlow({ ...PAID, allowed_call_types: ["audio"], acceptance_deadline_at: "2026-10-24T10:30:00Z", final_payment_id: "p9", final_amount: 472500, can_start: true, start_url: "/marketplace/orders/o1/start" });
    expect(f.callTypes).toEqual(["audio"]);
    expect(f.acceptanceDeadlineAt).toBe("2026-10-24T10:30:00Z");
    expect(f.finalPayment).toEqual({ id: "p9", amount: 472500, status: "", url: "" });
    expect(f.canStart).toBe(true);
    expect(f.startUrl).toBe("/marketplace/orders/o1/start");
  });
  it("never follows a non-https absolute link", () => {
    expect(normFlow({ ...PAID, final_payment: { id: "p", amount: 1, payment_url: "http://x.test/pay" } }).finalPayment?.url).toBe("");
    expect(normFlow({ ...PAID, start_url: "javascript:alert(1)", can_start: true }).canStart).toBe(false);
  });
  it("treats a submitted complaint as used", () => {
    expect(normFlow({ ...PAID, complaint: { available: false, submitted: false, complaint_id: "c1" } }).complaint.submitted).toBe(true);
  });
});

describe("financials", () => {
  it("keeps the backend rows, plan and commission as sent", () => {
    const f = normFinancials({
      snapshot: { gross_amount: 135000, currency: "UZS", historical_policy_exact: false, commission: { effective_percent: 18, platform_amount: 24300, seller_net_amount: 110700 }, payment: { advance_percent: 10, advance_amount: 13500, final_percent: 90, final_amount: 121500 } },
      payments: [{ id: "a", stage: "marketplace_order", status: "paid", amount: 100000, paid_amount: 100000 }, { id: "b", stage: "marketplace_additional_payment", status: "paid", amount: 35000, paid_amount: 35000 }],
      settlement: null,
    });
    expect(f.gross).toBe(135000);
    expect(f.commission).toEqual({ percent: 18, platform: 24300, net: 110700 });
    expect(f.payments.map((p) => p.kind)).toEqual(["full", "additional"]);
    expect(f.settlement).toBe("");
    expect(f.historical).toBe(true);
  });
  it("labels stages without guessing amounts", () => {
    expect(payKindOf("marketplace_advance")).toBe("advance");
    expect(payKindOf("marketplace_final_payment")).toBe("final");
    expect(payKindOf("marketplace_package_order")).toBe("full");
    expect(payKindOf("marketplace_refund")).toBe("refund");
    expect(payKindOf("x")).toBe("other");
    expect(normFinancials({ settlement: { status: "Complaint_Hold" } }).settlement).toBe("complaint_hold");
  });
});

describe("checklist", () => {
  it("reads items, statuses, proof needs and the progress counts", () => {
    const c = normChecklist({
      order_id: "o1", completed_count: 1, total_count: 2, progress_percent: 50, snapshot_locked: true, work_phase: "execution",
      file_upload: { url: "/secure-chats/r1/messages/upload" },
      items: [
        { id: "i2", title: "Xulosa", status: "pending", required: true, comment_required: true, sort_order: 2 },
        { id: "i1", title: "Hujjatlar", status: "completed", required: false, files: [{ file_id: "f1", file_name: "a.pdf" }], sort_order: 1 },
      ],
    });
    expect(c.items.map((i) => i.id)).toEqual(["i1", "i2"]);
    expect(c.items[0].status).toBe("done");
    expect(c.items[0].files).toEqual([{ id: "f1", name: "a.pdf", url: "" }]);
    expect(c.items[1]).toMatchObject({ required: true, commentRequired: true, skipAllowed: false });
    expect(c.progress).toEqual({ done: 1, total: 2, requiredDone: 0, requiredTotal: 1, percent: 50 });
    expect(c.uploadRoomId).toBe("r1");
    expect(c.snapshotLocked).toBe(true);
  });
  it("prefers the backend's progress object", () => {
    expect(normChecklist({ items: [], progress: { done: 0, total: 0, required_done: 0, required_total: 0, percent: 100 } }).progress.percent).toBe(100);
  });
});

describe("caps & timeline", () => {
  it("reads the warranty choices and windows", () => {
    const c = normCaps({ payments: { advance_percent: 10, final_percent: 90, provider_enabled: false }, marketplace_assignment: { seller_response_minutes: 30 }, rating_and_complaint: { window_minutes: 15, low_rating_auto_complaint: true }, warranty: { replacement: true, full_refund: true } });
    expect(c).toEqual({ advancePercent: 10, finalPercent: 90, providerEnabled: false, sellerResponseMinutes: 30, ratingWindowMinutes: 15, lowRatingAutoComplaint: true, warrantyChoices: ["replacement", "full_refund"] });
    expect(normCaps({}).warrantyChoices).toEqual([]);
  });
  it("takes the step from data.status, oldest first", () => {
    const t = normTimeline({ items: [{ id: "2", type: "status", status: "active", at: "2026-10-16T14:41:53Z", data: { status: "completed", note: "tugadi!" } }, { id: "1", type: "status", status: "active", at: "2026-10-15T10:00:00Z", data: { status: "in_progress" } }] });
    expect(t.map((e) => [e.status, e.note])).toEqual([["in_progress", ""], ["completed", "tugadi!"]]);
  });
});

describe("phase & contact gates", () => {
  const base = { roomId: "r1", canStartChat: true, canCreateCall: true };
  it("orders the phases from the backend status", () => {
    const f = normFlow(PAID);
    expect(phaseOf({ status: "paid", paymentStatus: "paid", flow: f })).toBe("paid");
    expect(phaseOf({ status: "in_progress", paymentStatus: "paid", flow: f })).toBe("in_progress");
    expect(phaseOf({ status: "completed", paymentStatus: "paid", flow: f })).toBe("completed");
    expect(phaseOf({ status: "completed", paymentStatus: "paid", flow: f, rated: true })).toBe("rated");
    expect(phaseOf({ status: "cancelled", paymentStatus: "cancelled", flow: f })).toBe("cancelled");
    expect(phaseOf({ status: "pending_payment", paymentStatus: "pending", flow: f })).toBe("pending");
    const asg = normFlow({ ...PAID, status: "sent_to_seller", contact_unlocked: false, acceptance_deadline_at: "2026-10-24T10:30:00Z" });
    expect(phaseOf({ status: "sent_to_seller", paymentStatus: "pending", flow: asg })).toBe("assigned");
    const acc = normFlow({ ...PAID, status: "accepted", contact_unlocked: false });
    expect(phaseOf({ status: "accepted", paymentStatus: "pending", flow: acc })).toBe("advance");
  });
  it("opens chat and calls only once the backend unlocked contact", () => {
    const locked = normFlow({ ...PAID, contact_unlocked: false });
    expect(chatModeOf({ ...base, flow: locked }, "advance")).toBe("locked");
    expect(callTypesOf({ ...base, flow: locked }, "advance")).toEqual([]);
    const f = normFlow(PAID);
    expect(chatModeOf({ ...base, flow: f }, "paid")).toBe("open");
    expect(callTypesOf({ ...base, flow: f }, "paid")).toEqual(["audio", "video"]);
    expect(chatModeOf({ ...base, flow: f }, "completed")).toBe("readOnly");
    expect(callTypesOf({ ...base, flow: f }, "completed")).toEqual([]);
    expect(chatModeOf({ ...base, roomId: "", flow: f }, "cancelled")).toBe("none");
  });
});

describe("windows", () => {
  const now = Date.parse("2026-10-24T10:00:00Z");
  it("counts down to the backend deadline", () => {
    expect(msUntil("2026-10-24T10:00:30Z", now)).toBe(30000);
    expect(msUntil("bad", now)).toBe(0);
    expect(answerState("2026-10-24T10:00:30Z", now)).toBe("open");
    expect(answerState("2026-10-24T09:59:00Z", now)).toBe("expired");
    expect(answerState("", now)).toBe("none");
    expect(clock(30000)).toBe("00:30");
    expect(clock(3723000)).toBe("01:02:03");
  });
  it("closes the complaint after its deadline and never offers it twice", () => {
    const c = { available: true, deadlineAt: "2026-10-24T10:05:00Z", submitted: false, id: "", url: "", status: "" };
    expect(complaintState(c, now)).toBe("open");
    expect(complaintState(c, now + 6 * 60000)).toBe("closed");
    expect(complaintState({ ...c, submitted: true }, now)).toBe("submitted");
    expect(complaintState({ ...c, available: false, deadlineAt: "" }, now)).toBe("none");
  });
});

describe("error codes", () => {
  const err = (status: number, detail: unknown) => new ApiError(status, undefined, { data: { detail }, code: typeof detail === "object" && detail ? String((detail as { code?: string }).code ?? "") || undefined : undefined });
  it("reads detail.code and maps the TZ codes", () => {
    const e = err(409, { code: "assignment_response_deadline_expired" });
    expect(codeOf(e)).toBe("assignment_response_deadline_expired");
    expect(flowErrorKey(e)).toBe("mf.err.assignment_response_deadline_expired");
    expect(needsRefetch(e)).toBe(true);
    expect(flowErrorKey(err(409, "busy"))).toBe("mf.err.conflict");
    expect(flowErrorKey(err(500, "x"))).toBe("");
    expect(flowErrorKey(new Error("x"))).toBe("");
  });
  it("lists the blocking checklist items", () => {
    const e = err(409, { code: "required_checklist_incomplete", blocking_items: [{ id: "i1", title: "Xulosa" }, "Hujjat"] });
    expect(blockingItems(e)).toEqual([{ id: "i1", title: "Xulosa" }, { id: "", title: "Hujjat" }]);
    expect(blockingItems(err(409, { code: "required_checklist_incomplete", blocking_item_ids: ["abc"] }))).toEqual([{ id: "abc", title: "" }]);
    expect(blockingItems(err(409, { code: "other" }))).toBeNull();
  });
});

describe("checklist gates", () => {
  const { blockingOf, checkIssue } = jest.requireActual("./checklist") as typeof import("./checklist");
  const item = (p: Partial<import("../model/types").CheckItem>) => ({ id: "i", title: "t", clientTitle: "", description: "", status: "pending" as const, required: true, commentRequired: false, fileRequired: false, imageRequired: false, skipAllowed: false, comment: "", files: [], images: [], updatedAt: "", sortOrder: 0, ...p });
  const list = (items: ReturnType<typeof item>[]) => ({ orderId: "o", items, progress: { done: 0, total: 0, requiredDone: 0, requiredTotal: 0, percent: 0 }, snapshotLocked: false, uploadRoomId: "", phase: "" });
  it("blocks on a pending required item or a skip the backend does not allow", () => {
    expect(blockingOf(list([item({ id: "a" }), item({ id: "b", status: "done" }), item({ id: "c", required: false })])).map((i) => i.id)).toEqual(["a"]);
    expect(blockingOf(list([item({ id: "a", status: "skipped_with_reason", skipAllowed: false })])).map((i) => i.id)).toEqual(["a"]);
    expect(blockingOf(list([item({ id: "a", status: "skipped_with_reason", skipAllowed: true })]))).toEqual([]);
    expect(blockingOf(null)).toEqual([]);
  });
  it("asks for the reason, comment or proof the item needs", () => {
    const d = { status: "done" as const, comment: "", files: 0, images: 0 };
    expect(checkIssue(item({}), d)).toBeNull();
    expect(checkIssue(item({ commentRequired: true }), d)).toBe("needComment");
    expect(checkIssue(item({ fileRequired: true }), { ...d, comment: "x" })).toBe("needFile");
    expect(checkIssue(item({ imageRequired: true }), { ...d, files: 1 })).toBe("needImage");
    expect(checkIssue(item({ skipAllowed: false }), { ...d, status: "skipped_with_reason" })).toBe("noSkipRequired");
    expect(checkIssue(item({ skipAllowed: true }), { ...d, status: "skipped_with_reason" })).toBe("needReason");
    expect(checkIssue(item({ skipAllowed: true }), { ...d, status: "skipped_with_reason", comment: "mijoz bermadi" })).toBeNull();
  });
});
