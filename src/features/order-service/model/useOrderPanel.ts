import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createOrder, orderKeys, usePriceQuote, type Order } from "@/entities/order";
import { useCandidates, useServiceSellers, type Lawyer } from "@/entities/lawyer";
import { useSession } from "@/entities/session";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

export type SellerSort = "match" | "rating" | "exp" | "price";
export type OrderTarget = { id: string; name: string };
// TZ.md §3: "automatic seller selection" — the order goes without lawyer_user_id and the platform assigns the specialist.
export const AUTO = "auto";

// The order form: advocates who perform the service (ranked by the backend's matching score) or the platform's own choice, the
// final price for the chosen one (region/experience/referral modifiers), the client's short description, the order itself.
export function useOrderPanel(service: OrderTarget, preSellerId: string, packageId: string) {
  const qc = useQueryClient();
  const region = useSession()?.user.region ?? "";
  const sellers = useServiceSellers(service.id);
  const cands = useCandidates(service.id, region);
  const [picked, setPicked] = useState("");
  const [sort, setSort] = useState<SellerSort>("match");
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [created, setCreated] = useState<Order | null>(null);
  const [problem, setProblem] = useState("");
  const rows = useMemo(() => sellers.data ?? [], [sellers.data]);
  // The advocate chosen in the directory is picked as soon as they turn out to offer this service.
  const sellerId = picked || (preSellerId && rows.some((r) => r.userId === preSellerId) ? preSellerId : "");
  const auto = sellerId === AUTO;
  const quote = usePriceQuote(service.id, auto ? "" : sellerId, region, packageId);
  const score = useMemo(() => new Map((cands.data ?? []).map((c) => [c.lawyerUserId, c])), [cands.data]);
  const sorted = useMemo(() => {
    const val = (l: Lawyer) => score.get(l.userId)?.score ?? -1;
    return [...rows].sort((a, b) => {
      if (sort === "price") return (a.basePrice || Infinity) - (b.basePrice || Infinity);
      if (sort === "exp") return b.experienceYears - a.experienceYears;
      if (sort === "match" && val(a) !== val(b)) return val(b) - val(a);
      return Number(b.rated) - Number(a.rated) || b.rating - a.rating;
    });
  }, [rows, sort, score]);

  const buy = async () => {
    if (busy) return;
    if (!sellerId) return setMissing(true);
    setMissing(false);
    setBusy(true);
    setFailed(false);
    try {
      const o = await createOrder({ serviceId: service.id, lawyerUserId: auto ? undefined : sellerId, packageId, region, problem, title: service.name });
      successHaptic();
      void qc.invalidateQueries({ queryKey: orderKeys.list });
      void qc.invalidateQueries({ queryKey: ["market-orders"] });
      setCreated(o);
    } catch {
      errorHaptic();
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return {
    sellers, sorted, score, sellerId, setSellerId: (id: string) => { setPicked(id); setMissing(false); },
    sort, setSort, sortable: !sellers.isPending && rows.filter((l) => l.userId).length > 1,
    quote, missing, busy, failed, created, orderId: created?.id ?? "", buy, region, auto, problem, setProblem,
    preOffers: preSellerId && !sellers.isPending ? rows.some((r) => r.userId === preSellerId) : null,
  };
}
