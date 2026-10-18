import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useSocketState } from "@/shared/realtime";
import { listRows, PAGE_ROWS } from "../api/notificationApi";
import { foldNotifications } from "./fold";
import { notificationKeys } from "./keys";
import type { Notification } from "./types";

export type NotifView = { rows: Notification[]; items: Notification[] };

// Pages are raw per-channel rows; the folded events (one per notification) are derived here, over
// everything loaded, so an event split across a page boundary still folds into one.
export function viewOf(rows: Notification[]): NotifView {
  const seen = new Set<string>();
  const unique = rows.filter((r) => !seen.has(r.id) && !!seen.add(r.id));
  return { rows: unique, items: foldNotifications(unique) };
}
const view = (data: InfiniteData<Notification[]>): NotifView => viewOf(data.pages.flat());

// Newest first, 100 rows per page. The socket keeps it current; polling is only a fallback while it is down.
export function useNotifications() {
  const authed = useIsAuthed();
  const live = useSocketState() === "online";
  return useInfiniteQuery({
    queryKey: notificationKeys.list,
    queryFn: ({ pageParam, signal }) => listRows({ offset: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length >= PAGE_ROWS ? all.length * PAGE_ROWS : undefined),
    select: view,
    enabled: authed,
    staleTime: 30_000,
    refetchInterval: live ? false : 30_000,
  });
}
