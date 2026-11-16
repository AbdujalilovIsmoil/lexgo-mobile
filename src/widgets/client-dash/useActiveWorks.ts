import { useMemo } from "react";
import { useMarketOrders, type MarketOrder } from "@/entities/order";
import { useIsAuthed } from "@/entities/session";

// The web client dashboard's "Jarayondagi ishlar" (law: components/portal/dash/ClientHome.tsx): the client's marketplace orders
// (GET /marketplace/me/orders?role_view=client) that are not finished, newest first.
const FINAL = new Set(["completed", "rated", "lost", "cancelled", "canceled", "declined", "refunded"]);

// The client-facing steps of an order (law: lib/orderStatus.ts clientStageOf) and the step of four each one shows.
type Stage = "request" | "matching" | "payment" | "work" | "done";
const STAGE_OF: Record<string, Stage> = {
  new: "request",
  waiting_info: "request",
  waiting_docs: "request",
  seller_selection: "matching",
  sent_to_seller: "matching",
  accepted: "matching",
  waiting_payment: "payment",
  pending_payment: "payment",
  payment_pending: "payment",
  paid: "work",
  started: "work",
  in_progress: "work",
  result_ready: "work",
  quality_check: "work",
  delivered: "done",
  client_confirmation: "done",
  completed: "done",
  rated: "done",
};
const STEP: Record<Stage, number> = { request: 1, matching: 1, payment: 2, work: 3, done: 4 };

export const workStage = (o: MarketOrder): Stage => STAGE_OF[(o.status || "").trim().toLowerCase()] ?? "request";
export const workStep = (o: MarketOrder): number => STEP[workStage(o)];

export function useActiveWorks() {
  const authed = useIsAuthed();
  const q = useMarketOrders(authed);
  const active = useMemo(
    () => (q.data ?? []).filter((o) => !FINAL.has((o.status || "").toLowerCase())).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [q.data],
  );
  return { active, loading: q.isLoading, error: q.isError ? q.error : null, refetch: () => void q.refetch() };
}
