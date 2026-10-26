import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import { fmtMoney } from "@/shared/lib/money";
import type { Cabinet, CabinetCase, CabinetNote, Onboarding, Payout, SellerOrder, Stats } from "../model/types";

const normCase = (v: unknown): CabinetCase => {
  const d = asDict(v);
  return { id: asStr(d.id), number: asStr(d.case_number), title: asStr(d.title ?? d.case_type), stage: asStr(d.stage), status: asStr(d.status), nextAction: asStr(d.next_action), deadlineAt: asStr(d.deadline_at) };
};

// One offered order; the client's own sentence (details.question) is the best title, then the catalogue names.
const normOrder = (v: unknown): SellerOrder => {
  const d = asDict(v);
  const details = asDict(d.details);
  const service = asDict(d.service);
  const amount = uzs(d, "price", "amount");
  return {
    id: asStr(d.id),
    title: asStr(details.question) || asStr(d.title ?? details.title ?? service.name),
    serviceName: asStr(service.name ?? service.title ?? d.service_name ?? d.service_title ?? details.service_title ?? details.service_name),
    region: asStr(d.region ?? details.region),
    budget: amount > 0 ? `${fmtMoney(amount)}` : asStr(details.budget),
    status: asStr(d.status),
    createdAt: asStr(d.created_at ?? d.createdAt),
    deadline: asStr(d.confirmation_deadline_at ?? details.confirmation_deadline_at),
  };
};
// A marketplace order that is still waiting for the client's payment is not an offer yet.
const unpaid = (v: unknown): boolean => asStr(asDict(v).source).toLowerCase() === "marketplace" && asStr(asDict(v).status).toLowerCase() === "pending_payment";
const normNote = (v: unknown): CabinetNote => {
  const d = asDict(v);
  return { id: asStr(d.id), title: asStr(d.title), body: asStr(d.body), createdAt: asStr(d.created_at) };
};

// GET /lawyers/me/cabinet — the app's only reader of it: the onboarding and the chat take their slice (useCabinetSlice). Flags count only
// when they are `true`; an action the backend does not list follows the overall access level.
export async function getCabinet(): Promise<Cabinet> {
  const d = asDict(await http("/lawyers/me/cabinet"));
  const limited = d.limited_access === true;
  const a = asDict(d.available_actions);
  const allowed = (k: string) => (a[k] == null ? !limited : a[k] === true);
  const profile = asDict(d.profile);
  const v = asDict(d.verification);
  const stats = asDict(d.stats);
  const workload = asDict(stats.workload);
  return {
    accountStatus: asStr(d.account_status), limited, limitedReason: asStr(d.limited_reason),
    verified: v.is_verified === true || v.verified === true || profile.is_verified === true,
    verification: typeof d.verification === "string" ? d.verification : asStr(v.status ?? v.verification_status ?? profile.verification_status),
    sellerType: asStr(d.seller_type ?? profile.seller_type),
    actions: { acceptOrders: allowed("accept_orders"), secureChat: allowed("secure_chat"), calls: allowed("calls") },
    name: asStr(profile.lawyer_name ?? profile.name), region: asStr(profile.region), license: asStr(profile.license_number),
    workload, finance: asDict(stats.finance), performance: asDict(stats.performance),
    newOrders: asArr(d.new_orders).length, unread: asNum(workload.unread_messages),
    cases: asArr(d.active_cases).map(normCase),
    orders: listFrom(d.new_orders, "orders", "items", "data").filter((x) => !unpaid(x)).map(normOrder),
    notes: listFrom(d.notifications, "items", "data").map(normNote),
    clients: new Set(listFrom(d.secure_chats, "rooms", "items", "data").map((r) => asStr(asDict(r).client_user_id)).filter(Boolean)).size,
    profile: { reviews: asNum(profile.reviews_count ?? profile.reviews), experienceYears: asNum(profile.experience_years ?? profile.lawyer_experience_years), totalCases: asNum(profile.total_cases) },
  };
}

export async function getStats(): Promise<Stats> {
  const d = asDict(await http("/lawyers/me/stats"));
  const p = asDict(await http("/lawyers/me").catch(() => ({})));
  return { workload: asDict(d.workload), finance: asDict(d.finance), performance: asDict(d.performance), experienceYears: asNum(p.experience_years), totalCases: asNum(p.total_cases), reviews: asNum(p.reviews_count ?? p.reviews) };
}

// GET /seller-onboarding/progress — the profile checklist (profile, identity, documents, services, pricing).
export async function getOnboarding(): Promise<Onboarding> {
  const d = asDict(await http("/seller-onboarding/progress"));
  const steps = asArr(d.steps).map(asDict);
  return { status: asStr(d.status), done: d.completed_count == null ? steps.filter((s) => s.completed).length : asNum(d.completed_count), total: d.total_count == null ? steps.length : asNum(d.total_count) };
}

// GET /payouts/me — the payout ledger (seller share of paid orders).
export async function getPayouts(): Promise<Payout[]> {
  return listFrom(await http("/payouts/me"), "items", "data").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), amount: uzs(d, "amount", "seller_share"), status: asStr(d.status, "pending").toLowerCase(), period: asStr(d.period ?? d.month), createdAt: asStr(d.created_at) };
  });
}
