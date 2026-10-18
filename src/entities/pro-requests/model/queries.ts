import { useQuery } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { listDocs, listPool } from "../api/docsApi";
import { listMeetings, listOrders, listUrgent } from "../api/workApi";
import type { ReqItem, ReqKind } from "./types";

export const reqKeys = { all: ["pro-requests"] as const };
const byRecent = (a: ReqItem, b: ReqItem) => b.at.localeCompare(a.at);

const FETCH: Record<ReqKind, () => Promise<ReqItem[]>> = { docs: listDocs, urgent: listUrgent, orders: listOrders, meetings: listMeetings, pool: listPool };

// One segment of the unified inbox; the pool needs the call-center-lawyer role.
export function useRequests(kind: ReqKind) {
  const authed = useIsAuthed();
  const { seller, callCenterLawyer } = useAccess();
  const on = authed && seller && (kind !== "pool" || callCenterLawyer);
  return useQuery({ queryKey: [...reqKeys.all, kind], queryFn: async () => (await FETCH[kind]()).sort(byRecent), enabled: on, retry: false });
}
