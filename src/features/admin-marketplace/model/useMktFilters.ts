import { useMemo, useState } from "react";
import { useDateRange } from "@/shared/ui/admin";
import type { MktScope } from "@/entities/admin-marketplace";

export type Party = { id: string; label: string };

// Filter state of the marketplace monitor: period, status, seller and client. `scope` goes straight to the API.
export function useMktFilters() {
  const bar = useDateRange("all");
  const [status, setStatus] = useState("");
  const [seller, setSeller] = useState<Party | null>(null);
  const [client, setClient] = useState<Party | null>(null);
  const { from, to } = bar.range;
  const scope: MktScope = useMemo(() => ({ status, sellerUserId: seller?.id ?? "", clientUserId: client?.id ?? "", dateFrom: from, dateTo: to }), [status, seller, client, from, to]);
  const active = !!(status || seller || client || from || to);
  const reset = () => {
    bar.setPreset("all");
    setStatus("");
    setSeller(null);
    setClient(null);
  };
  // Patch several filters at once ("this seller's orders"); keys left out stay as they are.
  const focus = (p: { status?: string; seller?: Party | null; client?: Party | null }) => {
    if (p.status !== undefined) setStatus(p.status);
    if (p.seller !== undefined) setSeller(p.seller);
    if (p.client !== undefined) setClient(p.client);
  };
  return { bar, scope, status, setStatus, seller, setSeller, client, setClient, active, reset, focus };
}
export type MktFilters = ReturnType<typeof useMktFilters>;
