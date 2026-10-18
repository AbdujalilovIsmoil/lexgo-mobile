// Demo answers, in the backend's own JSON shapes, so the normal parsers read them like real data. Only GET requests of the
// listed paths are answered; everything else goes to the server as usual. Dates are relative to "now", so a demo never looks stale.
const day = (n: number, h = 10) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0); return d.toISOString(); };
const inMin = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

const cabinet = () => ({
  limited_access: false, account_status: "active", role: "yurist", seller_type: "yurist",
  available_actions: { accept_orders: true, secure_chat: true, calls: true },
  verification: { is_verified: true, status: "approved" },
  profile: { lawyer_name: "Demo Yurist", region: "tashkent", languages: ["uz", "ru"], education: "TDYU", bio: "Mehnat va oila huquqi", license_number: "L-2026", reviews_count: 14, experience_years: 6, total_cases: 23, specializations: ["labor", "family"], is_verified: true },
  stats: {
    workload: { active_cases: 5, courts_today: 2, deadlines_today: 3, unread_messages: 4, documents_to_review: 6 },
    finance: { earnings_today: 350000, earnings_month: 8450000, pending_payout: 1200000, currency: "UZS" },
    performance: { response_rate: 0.94, acceptance_rate: 0.82, avg_response_minutes: 9, rating: 4.8 },
  },
  new_orders: [
    { id: "demo-o1", status: "new", price: 350000, region: "Toshkent", created_at: day(0, 9), confirmation_deadline_at: inMin(21), details: { question: "Ish beruvchi 3 oydan beri maosh bermayapti, nima qilish kerak?" }, service: { name: "Mehnat nizolari bo'yicha maslahat" } },
    { id: "demo-o2", status: "new", price: 900000, region: "Samarqand", created_at: day(0, 8), confirmation_deadline_at: inMin(4), details: { question: "Ajralish va nafaqa bo'yicha da'vo arizasi kerak." }, service: { name: "Oilaviy nizolar" } },
  ],
  active_cases: [
    { id: "demo-c1", case_number: "CASE-2026-101", title: "Mehnat nizosi", stage: "Sud", status: "active", next_action: "Da'vo arizasini topshirish", deadline_at: day(0, 15) },
    { id: "demo-c2", case_number: "CASE-2026-102", title: "Nikoh shartnomasi", stage: "Tayyorlash", status: "active", next_action: "Shartnoma loyihasini yuborish", deadline_at: day(2) },
    { id: "demo-c3", case_number: "CASE-2026-103", title: "Meros bo'linishi", stage: "Hujjatlar", status: "active", next_action: "", deadline_at: day(6) },
    { id: "demo-c4", case_number: "CASE-2026-090", title: "Ijara nizosi", stage: "Yopilgan", status: "completed", next_action: "", deadline_at: day(-4) },
  ],
  secure_chats: ["a", "b", "c", "d", "e", "f", "g"].map((x, i) => ({ id: `demo-r${i}`, client_user_id: `demo-client-${x}`, status: "active", created_at: day(-i), updated_at: day(-i) })),
  notifications: [],
});

const payouts = () => ({ items: [
  { id: "demo-p1", amount: 1200000, status: "pending", period: "2026-10", created_at: day(-1) },
  { id: "demo-p2", amount: 2450000, status: "paid", period: "2026-09", created_at: day(-18) },
  { id: "demo-p3", amount: 1800000, status: "paid", period: "2026-08", created_at: day(-49) },
] });

const referral = () => ({ code: "LXDEMO7", link: "https://lexgo.uz/r/LXDEMO7", qr_url: "", invited_count: 7, joined_count: 3, reward_balance: 150000, discount_unlocked: false, discount_percent: 25, eligible_after: 5, remaining_to_unlock: 2, items: [
  { name: "Aziz Karimov", phone: "+998901112233", status: "joined", reward: 50000, joined_at: day(-9) },
  { name: "Dilnoza Rahimova", phone: "+998902223344", status: "joined", reward: 50000, joined_at: day(-5) },
  { name: "Jasur Tursunov", phone: "+998903334455", status: "invited", reward: 0, joined_at: day(-2) },
] });

const works = () => ({ total: 4, items: [
  { id: "demo-w1", work_id: "DOC-D1001", type: "document_lawyer_work", title: "Ijara shartnomasi", status: "lawyer_review", assigned_lawyer: { name: "Demo Yurist", role: "yurist" }, has_chat: true, next_action: "Advokat ko'rib chiqmoqda", created_at: day(-2), updated_at: day(-1) },
  { id: "demo-w2", work_id: "ADV-D1002", type: "service_order", title: "Mehnat nizosi bo'yicha maslahat", status: "in_progress", assigned_lawyer: { name: "Demo Advokat", role: "advokat" }, has_chat: true, created_at: day(-5), updated_at: day(-1) },
  { id: "demo-w3", work_id: "DOC-D1003", type: "document_lawyer_work", title: "Da'vo arizasi", status: "file_ready", created_at: day(-9), updated_at: day(-8) },
  { id: "demo-w4", work_id: "URG-D1004", type: "urgent_advokat", title: "Shoshilinch yuridik yordam", status: "completed", created_at: day(-20), updated_at: day(-19) },
] });

const payments = () => ({ items: [
  { id: "demo-pay1", amount: 149000, status: "paid", provider: "atmos", target_type: "subscription_plan", description: "Shaxsiy advokat Standard", created_at: day(-3), receipt_url: "/x" },
  { id: "demo-pay2", amount: 350000, status: "pending", provider: "atmos", target_type: "order", description: "Mehnat nizosi bo'yicha maslahat", created_at: day(-1) },
  { id: "demo-pay3", amount: 90000, status: "refunded", provider: "atmos", target_type: "document", description: "Ijara shartnomasi", created_at: day(-14) },
] });

const clients = () => ({ items: [
  { id: "demo-cl1", name: "Aziz Karimov", phone: "+998901112233", cases_count: 3, orders_count: 2, active_case_ids: ["a", "b"], has_conflict: false, last_active_at: day(0) },
  { id: "demo-cl2", name: "Dilnoza Rahimova", phone: "+998902223344", cases_count: 1, orders_count: 1, active_case_ids: ["c"], has_conflict: true, last_active_at: day(-1) },
  { id: "demo-cl3", name: "Jasur Tursunov", phone: "+998903334455", cases_count: 2, orders_count: 0, active_case_ids: [], has_conflict: false, last_active_at: day(-4) },
  { id: "demo-cl4", name: "Malika Yusupova", phone: "", cases_count: 0, orders_count: 3, active_case_ids: [], has_conflict: false, last_active_at: day(-9) },
] });

const cases = () => ({ cases: [
  { id: "demo-c1", work_id: "CASE-D101", case_number: "CASE-2026-101", title: "Mehnat nizosi", description: "Ish beruvchi asossiz ishdan bo'shatgan; ish haqi va kompensatsiya undirish talab qilinadi.", case_type: "labor", stage: "court", status: "court", next_action: "Da'vo arizasini topshirish", deadline_at: day(0, 15), client_user_id: "demo-cl1", updated_at: day(0) },
  { id: "demo-c2", work_id: "CASE-D102", case_number: "CASE-2026-102", title: "Nikoh shartnomasi", case_type: "family", stage: "draft", status: "active", next_action: "Shartnoma loyihasini yuborish", deadline_at: day(2), client_user_id: "demo-cl2", updated_at: day(-1) },
  { id: "demo-c3", work_id: "CASE-D103", case_number: "CASE-2026-103", title: "Meros bo'linishi", case_type: "civil", stage: "documents", status: "investigation", next_action: "Notarial hujjatlarni yig'ish", deadline_at: day(-2), client_user_id: "demo-cl3", updated_at: day(-2) },
  { id: "demo-c4", work_id: "CASE-D104", case_number: "CASE-2026-104", title: "Ijara nizosi", case_type: "civil", stage: "appeal", status: "appeal", next_action: "Apellyatsiya shikoyatini tayyorlash", deadline_at: day(6), client_user_id: "demo-cl1", updated_at: day(-3) },
  { id: "demo-c5", work_id: "CASE-D105", case_number: "CASE-2026-105", title: "Soliq maslahati", case_type: "tax", stage: "new", status: "new", next_action: "", deadline_at: "", client_user_id: "demo-cl4", updated_at: day(-4) },
  { id: "demo-c6", work_id: "CASE-D090", case_number: "CASE-2026-090", title: "Ajralish", case_type: "family", stage: "completed", status: "completed", next_action: "", deadline_at: day(-12), client_user_id: "demo-cl2", updated_at: day(-12) },
] });

const events = () => ({ items: [
  { id: "demo-e1", type: "hearing", title: "Sud majlisi — Mehnat nizosi", starts_at: day(0, 10), ends_at: day(0, 12), location: "Toshkent shahar sudi", status: "active", reminder_minutes_before: 60, reminder_scheduled: true },
  { id: "demo-e2", type: "meeting", title: "Mijoz bilan uchrashuv", starts_at: day(0, 15), ends_at: day(0, 16), location: "Ofis", status: "active", reminder_minutes_before: 30, reminder_scheduled: true },
  { id: "demo-e3", type: "filing_deadline", title: "Da'vo arizasini topshirish muddati", starts_at: day(2, 17), location: "", status: "active" },
  { id: "demo-e4", type: "investigative", title: "Surishtiruv harakati", starts_at: day(4, 11), location: "IIB", status: "active" },
  { id: "demo-e5", type: "appeal_deadline", title: "Apellyatsiya muddati", starts_at: day(9, 18), location: "", status: "active" },
  { id: "demo-e6", type: "meeting", title: "Maslahat (bekor qilindi)", starts_at: day(1, 14), location: "Onlayn", status: "cancelled" },
  { id: "demo-e7", type: "hearing", title: "Ijara nizosi — sud", starts_at: day(-3, 10), location: "Yunusobod sudi", status: "active" },
] });

const stats = () => { const c = cabinet(); return { workload: c.stats.workload, finance: c.stats.finance, performance: c.stats.performance }; };
const progress = () => ({ status: "in_progress", completed_count: 4, total_count: 5, steps: [] });

const fold = (id: string, name: string, files: number, size: number, starred = false, parent = "") => ({ id, name, parent_id: parent, starred, size, file_count: files, folder_count: 0, status: "active", created_at: day(-9, 10) });
const file = (id: string, name: string, ext: string, size: number, folder = "", starred = false) => ({ id, file_name: name, extension: ext, size, folder_id: folder, starred, status: "active", created_at: day(-(size % 6), 12) });
const tree = () => ({
  quota: { quota_bytes: 5 * 1024 ** 3, used_bytes: 612 * 1024 ** 2, remaining_bytes: 4412 * 1024 ** 2, limit_gb: 5 },
  folders: [fold("demo-f1", "Mehnat nizolari", 2, 3_400_000, true), fold("demo-f2", "Shartnomalar", 1, 880_000), fold("demo-f3", "Mijoz hujjatlari", 0, 0)],
  files: [file("demo-d1", "Da'vo arizasi.pdf", "pdf", 1_240_000, "demo-f1", true), file("demo-d2", "Apellyatsiya.docx", "docx", 210_000, "demo-f1"), file("demo-d3", "Shartnoma namunasi.docx", "docx", 880_000, "demo-f2"),
    file("demo-d4", "Hisob-kitob.xlsx", "xlsx", 96_000), file("demo-d5", "Pasport nusxasi.jpg", "jpg", 2_300_000), file("demo-d6", "Arxiv.zip", "zip", 5_100_000)],
});

const docsOf = () => ({ items: [
  { id: "demo-cd1", work_id: "CASE-D101", title: "Da'vogar ishonchnomasi", status: "active", payload: { case_id: "demo-c1" }, created_at: day(-6) },
  { id: "demo-cd2", work_id: "CASE-D101", title: "Ish beruvchi javobi", status: "active", payload: { case_id: "demo-c1" }, created_at: day(-3) },
] });
const tasksOf = () => ({ items: [
  { id: "demo-t1", title: "Da'vo arizasini tayyorlash", status: "in_progress", priority: "high", due_date: day(1).slice(0, 10), case_id: "demo-c1", case_title: "Mehnat nizosi", checklist: [{ text: "Faktlarni yig'ish", done: true }, { text: "Dalillarni biriktirish", done: true }, { text: "Davlat boji", done: false }] },
  { id: "demo-t2", title: "Mijozga qo'ng'iroq", status: "todo", priority: "medium", due_date: day(0).slice(0, 10), case_id: "demo-c1", case_title: "Mehnat nizosi" },
  { id: "demo-t3", title: "Notarial hujjatlar", status: "todo", priority: "low", due_date: day(5).slice(0, 10), case_id: "demo-c3", case_title: "Meros bo'linishi" },
] });
const timelineOf = () => ({ items: [
  { id: "demo-tl1", record_type: "status_changed", title: "Holat o'zgardi", payload: { stage: "court", status: "court", next_action: "Da'vo arizasini topshirish" }, created_at: day(-1, 11) },
  { id: "demo-tl2", record_type: "stage_changed", title: "Bosqich", payload: { stage: "investigation", status: "investigation" }, created_at: day(-7, 14) },
  { id: "demo-tl3", record_type: "case_created", title: "Ish ochildi", payload: { stage: "new", status: "new" }, created_at: day(-14, 9) },
] });

const jobsOf = () => ({ orders: [
  { id: "demo-o1", work_id: "ORD-D201", status: "new", source: "mobile", service: { name: "Mehnat nizosi bo'yicha maslahat" }, details: { question: "Ish beruvchi meni ogohlantirmasdan ishdan bo'shatdi. Ish haqi ham to'lanmadi. Nima qilishim kerak va qaysi hujjatlar kerak bo'ladi?" }, region: "Toshkent", price: 250000, created_at: day(0, 9), confirmation_deadline_at: new Date(Date.now() + 18 * 60_000).toISOString() },
  { id: "demo-o2", work_id: "ORD-D202", status: "sent_to_seller", source: "marketplace", service: { name: "Ijara shartnomasini tuzish" }, details: { question: "Ofis ijarasi uchun shartnoma loyihasi kerak." }, region: "Samarqand", price: 800000, created_at: day(0, 8), confirmation_deadline_at: new Date(Date.now() + 3 * 60_000).toISOString() },
  { id: "demo-o3", work_id: "ORD-D203", status: "new", source: "mobile", service: { name: "Meros bo'yicha sud da'vosi" }, details: { question: "Otamdan qolgan uy bo'yicha aka-ukalar bilan nizo. Sudga da'vo yozish kerak." }, region: "Toshkent", price: 2500000, created_at: day(-1, 15), confirmation_deadline_at: new Date(Date.now() + 25 * 60_000).toISOString() },
  { id: "demo-o4", work_id: "ORD-D204", status: "new", source: "mobile", service: { name: "Nikoh shartnomasi" }, details: { question: "Nikoh shartnomasi namunasi va maslahat." }, region: "Andijon", price: 150000, created_at: day(-3, 11) },
  { id: "demo-o5", work_id: "ORD-D205", status: "new", source: "mobile", service: { name: "Soliq maslahati" }, details: {}, region: "", created_at: day(-6, 17) },
] });

const sellerOrders = () => ({ items: [
  { id: "demo-s1", work_id: "ADV-D301", status: "sent_to_seller", payment_status: "paid", service_title: "Mehnat nizosi bo'yicha maslahat", price: 250000, client: { name: "Aziz Karimov" }, created_at: day(0, 9) },
  { id: "demo-s2", work_id: "ADV-D302", status: "in_progress", payment_status: "paid", service_title: "Ijara shartnomasini tuzish", price: 800000, client: { name: "Dilnoza Yusupova" }, created_at: day(-2, 11) },
  { id: "demo-s3", work_id: "ADV-D303", status: "completed", payment_status: "paid", service_title: "Meros bo'yicha sud da'vosi", price: 2500000, client: { name: "Bobur Rahimov" }, created_at: day(-12, 15) },
  { id: "demo-s4", work_id: "ADV-D304", status: "cancelled", payment_status: "paid", service_title: "Nikoh shartnomasi", price: 150000, client: { name: "Madina Saidova" }, created_at: day(-20, 10) },
] });

const ago = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const urgentOf = () => [
  { id: "demo-u1", work_id: "URG-D2001", service_kind: "video_consultation", channel: "video", status: "meeting_active", region: "tashkent", need: "Ish beruvchi meni ogohlantirmasdan ishdan bo'shatdi va ish haqini to'lamadi. Bugun tushgacha nima qilishim kerakligini bilishim shart.", directions: ["mehnat"], price: 250000, meeting_minutes: 30, client: { id: "demo-cl1", name: "Aziz Karimov", phone: "+998901112233" }, scheduled_at: ago(-10), created_at: ago(12), sla_breached: false, can_manage: false, payload: { call_id: "demo-call1", status_history: [{ from: "open_pool", to: "claimed", changed_at: ago(9) }, { from: "claimed", to: "meeting_active", changed_at: ago(3) }] }, chat: { room_id: "demo-room1" }, assigned_lawyer: { id: "demo-me", name: "Demo Yurist" } },
  { id: "demo-u2", work_id: "URG-D2002", service_kind: "chat_consultation", channel: "chat", status: "claimed", region: "samarqand", need: "Ijara shartnomasini muddatidan oldin bekor qilish mumkinmi? Uy egasi depozitni qaytarmayapti.", directions: ["fuqarolik", "ijara"], client: { id: "demo-cl2", name: "Dilnoza Rahimova", phone: "+998902223344" }, created_at: ago(95), sla_breached: true, payload: { status_history: [{ from: "open_pool", to: "claimed", changed_at: ago(80) }] }, chat: { room_id: "demo-room2" } },
  { id: "demo-u3", work_id: "URG-D2003", service_kind: "traffic_accident_consultation", channel: "video", status: "open_pool", region: "andijon", need: "YTH sodir bo'ldi, aybdor tomon sug'urtani rad etmoqda. Nima qilish kerak?", directions: ["yth"], client: { id: "demo-cl3", name: "Jasur Tursunov", phone: "+998903334455" }, created_at: ago(4), payload: { immediate_call: true } },
  { id: "demo-u4", work_id: "URG-D2004", service_kind: "video_consultation", channel: "video", status: "completed", region: "toshkent", need: "Nikoh shartnomasi bo'yicha maslahat kerak edi.", directions: ["oila"], price: 150000, meeting_minutes: 30, client: { id: "demo-cl4", name: "Malika Yusupova", phone: "" }, created_at: ago(60 * 26), payload: { completed_at: ago(60 * 25), result_summary: "Shartnoma shartlari tushuntirildi.", status_history: [{ from: "open_pool", to: "claimed", changed_at: ago(60 * 26 - 5) }, { from: "claimed", to: "completed", changed_at: ago(60 * 25) }] } },
  { id: "demo-u5", work_id: "URG-D2005", service_kind: "chat_consultation", channel: "chat", status: "cancelled", region: "", need: "", directions: [], client: { id: "demo-cl1", name: "Aziz Karimov", phone: "+998901112233" }, created_at: ago(60 * 52), payload: { cancel_reason: "Mijoz javob bermadi", cancelled_at: ago(60 * 51) } },
];

const TABLE: Record<string, () => unknown> = {
  "/lawyers/me/cabinet": cabinet, "/payouts/me": payouts, "/referrals/me": referral, "/clients/me/works": works,
  "/calendar-events": events, "/lawyers/me/clients": clients, "/lawyers/me/cases": cases, "/payments": payments, "/lawyers/me/stats": stats, "/seller-onboarding/progress": progress, "/workspace/tree": tree, "/case-documents": docsOf, "/orders": jobsOf, "/marketplace/me/orders": sellerOrders, "/tasks/me": tasksOf, "/urgent-advokat/requests/assigned": () => ({ items: urgentOf() }),
};

/** The demo answer for a GET of `path` (query ignored), or undefined when this path has no demo data. */
export function demoAnswer(path: string): unknown {
  const p = path.split("?")[0];
  const one = /^\/cases\/(demo-[\w-]+)(\/timeline)?$/.exec(p); // one demo case (or its timeline)
  if (one) return one[2] ? timelineOf() : cases().cases.find((c) => c.id === one[1]);
  const ur = /^\/urgent-advokat\/requests\/(demo-u\d+)$/.exec(p); // one demo urgent job
  if (ur) return urgentOf().find((u) => u.id === ur[1]);
  const make = TABLE[p];
  return make ? make() : undefined;
}
