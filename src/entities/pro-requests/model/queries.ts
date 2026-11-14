import { useQuery } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { listDocs } from "../api/docsApi";
import { listMeetings, listOrders, listUrgent } from "../api/workApi";
import type { ReqItem, ReqKind } from "./types";

export const reqKeys = { all: ["pro-requests"] as const };
const byRecent = (a: ReqItem, b: ReqItem) => b.at.localeCompare(a.at);

const FETCH: Record<ReqKind, () => Promise<ReqItem[]>> = { docs: listDocs, urgent: listUrgent, orders: listOrders, meetings: listMeetings };

// One segment of the unified inbox; `enabled` lets a screen that does not show the segment skip it.
export function useRequests(kind: ReqKind, enabled = true) {
  const authed = useIsAuthed();
  const { seller } = useAccess();
  const on = authed && seller && enabled;
  return useQuery({ queryKey: [...reqKeys.all, kind], queryFn: async () => (await FETCH[kind]()).sort(byRecent), enabled: on, retry: false });
}
