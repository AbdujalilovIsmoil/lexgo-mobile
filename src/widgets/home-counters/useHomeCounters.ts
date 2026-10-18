import { useUnreadCount } from "@/entities/notification";
import { useOrders } from "@/entities/order";
import { useEntitlements } from "@/entities/plan";
import { isOpenWork, useWorks } from "@/entities/work";
import { isPendingPayment, useChatRooms, useDocTotals, usePayments } from "@/entities/client-stats";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import type { IconName } from "@/shared/ui";
import type { ListKind } from "./CounterSheet";

export type Counter = { key: string; label: string; value: string; hint?: string; icon: IconName; tint: string; loading: boolean; kind?: ListKind; path?: string };

const ORDER_DONE = new Set(["completed", "rated", "cancelled", "canceled", "declined", "rejected", "lost", "closed"]);

// TZ 7: every number is counted from the real endpoints; none is a demo value.
export function useHomeCounters(): Counter[] {
  const { t, locale } = useT();
  const works = useWorks();
  const docs = useDocTotals();
  const orders = useOrders();
  const pays = usePayments();
  const chats = useChatRooms();
  const ent = useEntitlements();
  const unread = useUnreadCount();
  const val = (q: { isError: boolean; isLoading: boolean }, v: string) => (q.isError ? "—" : v);
  const open = works.items.filter((w) => isOpenWork(w.status)).length;
  const activeOrders = orders.data?.filter((o) => !ORDER_DONE.has(o.status)).length ?? 0;
  const pending = pays.data?.filter(isPendingPayment) ?? [];
  const rooms = chats.data?.filter((r) => r.unread > 0) ?? [];
  const ends = ent.data?.endsAt ? fmtDate(ent.data.endsAt, locale) : "";
  return [
    { key: "works", label: t("cl6.counters.works"), value: val(works, String(open)), hint: t("cl6.counters.worksHint", { n: works.total }), icon: "briefcase", tint: "#1668F0", loading: works.isLoading, kind: "works" },
    { key: "documents", label: t("cl6.counters.documents"), value: val(docs, String(docs.data?.total ?? 0)), hint: t("cl6.counters.documentsHint", { n: docs.data?.ready ?? 0 }), icon: "file-text", tint: "#00A6E6", loading: docs.isLoading, kind: "documents" },
    { key: "orders", label: t("cl6.counters.orders"), value: val(orders, String(activeOrders)), hint: t("cl6.counters.ordersHint", { n: orders.data?.length ?? 0 }), icon: "shopping-bag", tint: "#00A870", loading: orders.isLoading, kind: "orders" },
    { key: "payments", label: t("cl6.counters.payments"), value: val(pays, String(pending.length)), hint: pending.length ? `${fmtMoney(pending.reduce((n, p) => n + p.amount, 0))} ${t("common.currency")}` : t("cl6.counters.paymentsNone"), icon: "credit-card", tint: "#C2680A", loading: pays.isLoading, kind: "payments" },
    { key: "chats", label: t("cl6.counters.chats"), value: val(chats, String(rooms.reduce((n, r) => n + r.unread, 0))), hint: t("cl6.counters.chatsHint", { n: rooms.length }), icon: "message-circle", tint: "#7A5CFF", loading: chats.isLoading, kind: "chats" },
    { key: "notifications", label: t("cl6.counters.notifications"), value: String(unread), hint: t("cl6.counters.notificationsHint"), icon: "bell", tint: "#E0457F", loading: false, path: "/notifications" },
    { key: "subscription", label: t("cl6.counters.subscription"), value: val(ent, ent.data?.active ? t("cl6.counters.subActive") : t("cl6.counters.subNone")), hint: ent.data?.active && ends ? t("cl6.counters.subUntil", { date: ends }) : t("cl6.counters.subChoose"), icon: "award", tint: ent.data?.active ? "#00A870" : "#5C6E85", loading: ent.isLoading, path: "/subscription" },
  ];
}
