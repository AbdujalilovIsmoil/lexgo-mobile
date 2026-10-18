// TEMPORARY dev fixtures for ADV2 screenshots — deleted before the final report.
const iso = (d: number, h = 10) => new Date(Date.now() + d * 86_400_000 + (h - 12) * 3_600_000).toISOString();
export const cabinet = { accountStatus: "active", limited: false, limitedReason: "", verified: true, verification: "approved", sellerType: "advokat", actions: { acceptOrders: true, secureChat: true, calls: true }, name: "Demo Advokat", region: "tashkent", license: "A-1234", workload: { active_cases: 4, courts_today: 1, deadlines_today: 2, unread_messages: 3, documents_to_review: 2 }, finance: { earnings_today: 0, earnings_month: 4200000, pending_payout: 1800000, earnings_via_lexgo: 3900000, payable: 600000 }, performance: { response_rate: 0.93, acceptance_rate: 0.8, avg_response_minutes: 12, rating: 4.7 }, newOrders: 1, unread: 3, cases: [] };
export const stats = { workload: cabinet.workload, finance: cabinet.finance, performance: cabinet.performance, experienceYears: 5, totalCases: 14, reviews: 12 };
const req = (kind: string, id: string, title: string, client: string, status: string, o: object = {}) => ({ kind, id, title, client, detail: "", amount: 0, when: "", status, at: iso(-0.2), route: "/pro/docs/" + id, action: ["claimed", "open_pool", "paid"].includes(status), active: !["completed", "cancelled"].includes(status), ...o });
export const reqs = {
  docs: [req("docs", "d1", "Ijara shartnomasi tuzish", "Aziza Karimova", "claimed", { detail: "Shartnoma" }), req("docs", "d2", "Da'vo arizasi", "Bobur Aliyev", "completed")],
  urgent: [req("urgent", "u1", "Tezkor video maslahat", "Sardor T.", "meeting_active", { detail: "video", when: iso(0, 15) })],
  orders: [req("orders", "o1", "Vasiylik masalasi bo'yicha maslahat", "Dilnoza R.", "paid", { amount: 280000 })],
  meetings: [req("meetings", "m1", "Mijoz bilan uchrashuv", "Aziza Karimova", "active", { detail: "video" })],
  pool: [req("pool", "p1", "0 dan hujjat tayyorlash", "Anvar S.", "open_pool")],
};
const c = (id: string, num: string, title: string, status: string, stage: string, client: string) => ({ id, workId: num, number: num, clientUserId: client, lawyerUserId: "me", orderId: id === "c1" ? "ord1" : "", type: "civil", stage, status, title, description: "Mijoz bilan kelishuv bo'yicha ish yuritish, hujjatlarni tayyorlash.", nextAction: "Sudga hujjat topshirish", deadlineAt: iso(5), createdAt: iso(-20), updatedAt: iso(-1) });
export const cases = [c("c1", "CASE-A1B2C", "Mehnat nizosi — ishga tiklash", "court", "filed", "cl1"), c("c2", "CASE-D3E4F", "Ijara shartnomasi bahsi", "active", "accepted", "cl2"), c("c3", "CASE-G5H6I", "Meros ishi", "completed", "completed", "cl1")];
export const clients = [
  { id: "cl1", name: "Aziza Karimova", phone: "+998901112233", casesCount: 2, ordersCount: 1, activeCaseIds: ["c1"], hasConflict: false, lastActiveAt: iso(-1) },
  { id: "cl2", name: "Bobur Aliyev", phone: "+998933334455", casesCount: 1, ordersCount: 0, activeCaseIds: ["c2"], hasConflict: true, lastActiveAt: iso(-3) },
];
export const detail = { manual: false, id: "cl1", name: "Aziza Karimova", phone: "+998901112233", region: "tashkent", company: "", notes: "Ish haqi bo'yicha nizo. Ertalab qo'ng'iroq qilish qulay.", createdAt: iso(-60), cases: [{ id: "c1", title: "Mehnat nizosi", sub: "CASE-A1B2C · filed", status: "court", at: iso(-1) }], orders: [{ id: "ord1", title: "Maslahat", sub: "ORD-1", status: "completed", at: iso(-9) }], payments: [], documents: [], timeline: [{ id: "t1", type: "case", title: "Mehnat nizosi", sub: "", status: "court", at: iso(-1) }], chats: [{ id: "room1", status: "active", caseId: "", orderId: "" }] };
