import { ApiError } from "@/shared/api";
import { normCaps, normChecklist, normFinancials, normFlow, normRefund, normTimeline, payKindOf } from "../api/norm";
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
    expect(f.complaint).toEqual({ available: false, deadlineAt: "", submitted: false, id: "", url: "", status: "", resolution: "", resolutionNote: "", reworkRequired: false, reworkDeadlineAt: "", reworkIteration: 0 });
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
  it("treats a complaint as used from the backend's flag, the id only when the flag is missing", () => {
    expect(normFlow({ ...PAID, complaint: { available: false, complaint_id: "c1" } }).complaint.submitted).toBe(true);
    // After a rework the old ruling stays (latest_resolved_complaint_id) while a new complaint may be filed in the fresh window.
    expect(normFlow({ ...PAID, complaint: { available: true, submitted: false, complaint_id: "c1", latest_resolved_complaint_id: "c1" } }).complaint.submitted).toBe(false);
  });
  it("reads the rework, the review stage, the delivery duration and the reassignment flags", () => {
    const f = normFlow({
      ...PAID, status: "in_progress", work_phase: "reviewing", review_deadline_at: "2026-10-22T12:00:00Z", review_duration: { value: 2, unit: "hour" },
      review_client_note: "Mutaxassis hujjatlaringizni o'rganmoqda", review_seller_note: "Muddatni tasdiqlang", duration: { value: 5, unit: "day", calendar: "business_days" },
      client_status_message: " So'rovingiz ko'rib chiqilmoqda ", waiting_replacement_acceptance: true, can_request_cancellation: true,
      complaint: { available: false, submitted: true, complaint_id: "c1", status: "rework_required", resolution: "valid_rework", resolution_note: "4-bo'lim", rework_required: true, rework_iteration: 1, rework_deadline_at: "2026-10-27T09:30:00Z" },
    });
    expect(f.workPhase).toBe("reviewing");
    expect(f.review).toEqual({ deadlineAt: "2026-10-22T12:00:00Z", completedAt: "", clientNote: "Mutaxassis hujjatlaringizni o'rganmoqda", sellerNote: "Muddatni tasdiqlang", value: 2, unit: "hour" });
    expect(f.duration).toEqual({ value: 5, unit: "day", calendar: "business_days" });
    expect(f.clientStatusMessage).toBe("So'rovingiz ko'rib chiqilmoqda");
    expect(f.waitingReplacement).toBe(true);
    expect(f.canRequestCancellation).toBe(true);
    expect(f.complaint).toMatchObject({ reworkRequired: true, reworkIteration: 1, reworkDeadlineAt: "2026-10-27T09:30:00Z", resolutionNote: "4-bo'lim", status: "rework_required" });
    expect(normFlow(PAID)).toMatchObject({ workPhase: "", review: null, duration: null, waitingReplacement: false, canRequestCancellation: false });
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
  it("reads the seller's payout stages as the backend lists them, and none from a client's filtered copy", () => {
    const f = normFinancials({ payouts: [
      { id: "p1", stage: "acceptance", status: "paid", gross_amount: 270000, net_amount: 270000, paid_at: "2026-10-27T10:00:00Z" },
      { id: "p2", stage: "first_checklist", status: "pending", gross_amount: 270000, net_amount: 270000 },
      { id: "p3", stage: "completion", status: "held", gross_amount: 360000, commission_amount: 162000, net_amount: 198000 },
    ] });
    expect(f.payouts.map((p) => [p.stage, p.status, p.net, p.commission])).toEqual([["acceptance", "paid", 270000, 0], ["first_checklist", "pending", 270000, 0], ["completion", "held", 198000, 162000]]);
    expect(normFinancials({ snapshot: { gross_amount: 900000 } }).payouts).toEqual([]);
  });
});

describe("refund", () => {
  it("treats a provider refund the backend handed to an operator as manual (Enterprise contract §13)", () => {
    const r = normRefund({ refund: { request_id: "r1", amount: 900000, currency: "UZS", status: "operator_required", provider_mode: "payme" }, provider_enabled: true });
    expect(r).toMatchObject({ status: "operator_required", manual: true, amount: 900000 });
    expect(normRefund({ refund: { request_id: "r2", status: "processing", provider_mode: "payme" }, provider_enabled: true })?.manual).toBe(false);
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
    expect(c).toEqual({ advancePercent: 10, finalPercent: 90, providerEnabled: false, providers: [], sellerResponseMinutes: 30, ratingWindowMinutes: 15, lowRatingAutoComplaint: true, warrantyChoices: ["replacement", "full_refund"], materialTransferConsent: false, payouts: null });
    expect(normCaps({}).warrantyChoices).toEqual([]);
  });
  it("reads the Enterprise contract's providers, payout stages and the transfer consent (live runtime-capabilities shape)", () => {
    const c = normCaps({
      payments: { collection_percent: 100, advance_percent: 100, final_percent: 0, providers: ["telegram_manual", "payme", "click"], provider_enabled: false },
      payouts: { acceptance_percent: 30, first_checklist_percent: 30, completion_gross_percent: 40, platform_commission_percent: 18, completion_payable_percent: 22 },
      warranty: { replacement: true, full_refund: true, material_transfer_requires_client_consent: true },
    });
    expect(c.providers).toEqual(["telegram_manual", "payme", "click"]);
    expect(c.providerEnabled).toBe(false);
    expect(c.payouts).toEqual({ acceptance: 30, firstChecklist: 30, completion: 40, commission: 18, completionPayable: 22 });
    expect(c.materialTransferConsent).toBe(true);
  });
  it("keeps the event's type, actor, choice and the client-visible reason", () => {
    const t = normTimeline({ items: [
      { id: "r", type: "reassignment", status: "active", at: "2026-10-26T18:30:00Z", actor: { name: "Call-markaz" }, data: { status: "waiting_seller_response", client_visible_reason: "Mutaxassis band" } },
      { id: "a", type: "assignment_resolution", status: "active", at: "2026-10-26T18:00:00Z", data: { status: "selected", choice: "refund" } },
    ] });
    expect(t.map((e) => [e.type, e.choice, e.note, e.actor])).toEqual([["assignment_resolution", "refund", "", ""], ["reassignment", "", "Mutaxassis band", "Call-markaz"]]);
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
    // Enterprise contract §4: a seller gets the order only after the full payment — then it waits for their answer.
    expect(phaseOf({ status: "sent_to_seller", paymentStatus: "paid", flow: asg })).toBe("assigned");
    expect(phaseOf({ status: "sent_to_seller", paymentStatus: "pending", flow: asg })).toBe("received");
    expect(phaseOf({ status: "payment_pending", paymentStatus: "pending", flow: f })).toBe("pending");
    expect(phaseOf({ status: "sent_to_seller", paymentStatus: "paid", flow: normFlow({ ...PAID, assignment_status: "waiting_seller_response" }) })).toBe("assigned");
    const acc = normFlow({ ...PAID, status: "accepted", contact_unlocked: false });
    expect(phaseOf({ status: "accepted", paymentStatus: "pending", flow: acc })).toBe("advance");
  });
  it("TZ §3: an order no specialist holds yet reads as received — never as paid, never as a search", () => {
    const open = normFlow({ ...PAID, status: "seller_selection", contact_unlocked: false, acceptance_deadline_at: null });
    for (const status of ["seller_selection", "new", "created", "sent_to_seller"]) expect(phaseOf({ status, paymentStatus: "", flow: open })).toBe("received");
    expect(phaseOf({ status: "new", paymentStatus: "paid", flow: normFlow(PAID) })).toBe("paid");
    expect(chatModeOf({ ...base, roomId: "", flow: open }, "received")).toBe("locked");
  });
  it("reads the call center's states, the refund, the review stage and the rework from the backend — an unknown status is never 'paid'", () => {
    const f = normFlow(PAID);
    const at = (status: string, paymentStatus = "paid", flow = f) => phaseOf({ status, paymentStatus, flow });
    expect(at("refund_pending")).toBe("refund");
    expect(at("refunded", "refunded")).toBe("refunded");
    expect(at("cancelled", "refunded")).toBe("refunded");
    expect(at("cancellation_review")).toBe("cancelReview");
    expect(at("resolution_required")).toBe("resolution");
    expect(at("sent_to_seller", "paid", normFlow({ ...PAID, waiting_replacement_acceptance: true }))).toBe("replacing");
    // A paid order with an answer window is the normal first assignment, not a replacement: only the backend's flag says "replacing".
    expect(at("sent_to_seller", "paid", normFlow({ ...PAID, acceptance_deadline_at: "2026-10-26T18:30:00Z" }))).toBe("assigned");
    expect(at("in_progress", "paid", normFlow({ ...PAID, work_phase: "reviewing" }))).toBe("reviewing");
    expect(at("in_progress", "paid", normFlow({ ...PAID, complaint: { rework_required: true } }))).toBe("rework");
    expect(at("something_new")).toBe("attention");
  });
  it("puts each phase on the request → payment → work → done track", () => {
    const { phaseStep } = jest.requireActual("./phase") as typeof import("./phase");
    expect(["received", "advance", "pending"].map((p) => phaseStep(p as never))).toEqual([1, 1, 1]);
    expect(["assigned", "paid", "reviewing", "in_progress", "rework", "cancelReview", "resolution", "replacing", "attention"].map((p) => phaseStep(p as never))).toEqual([2, 2, 2, 2, 2, 2, 2, 2, 2]);
    expect(["completed", "rated"].map((p) => phaseStep(p as never))).toEqual([4, 4]);
    expect(["cancelled", "refund", "refunded"].map((p) => phaseStep(p as never))).toEqual([-1, -1, -1]);
  });
  it("keeps a refunded or reassigned order's chat readable and its calls closed", () => {
    const f = normFlow({ ...PAID, chat_read_only: true, calls_enabled: false });
    expect(chatModeOf({ ...base, flow: f }, "refund")).toBe("readOnly");
    expect(chatModeOf({ ...base, flow: f }, "replacing")).toBe("readOnly");
    expect(chatModeOf({ ...base, roomId: "", flow: f }, "replacing")).toBe("locked");
    expect(callTypesOf({ ...base, flow: normFlow(PAID) }, "resolution")).toEqual([]);
  });
  it("keeps the chat locked and the calls closed until the seller accepts a paid order", () => {
    expect(chatModeOf({ ...base, roomId: "", flow: normFlow(PAID) }, "assigned")).toBe("locked");
    expect(callTypesOf({ ...base, flow: normFlow(PAID) }, "assigned")).toEqual([]);
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
    const c = { available: true, deadlineAt: "2026-10-24T10:05:00Z", submitted: false, id: "", url: "", status: "", resolution: "", resolutionNote: "", reworkRequired: false, reworkDeadlineAt: "", reworkIteration: 0 };
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
