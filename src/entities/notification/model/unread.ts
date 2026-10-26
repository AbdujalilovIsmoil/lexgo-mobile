import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useBadge } from "@/shared/lib/badgeStore";
import { listRows, PAGE_ROWS, serverUnreadRows } from "../api/notificationApi";
import { notificationKeys } from "./keys";
import { viewOf } from "./queries";
import type { Notification } from "./types";

// Every unread per-channel row, up to 300 (3 pages). The tab badge counts the *events* these fold
// into — the number the list shows — not the server's per-channel row count (/unread-count), which only
// serves as the cheap gate: nothing unread, no pages.
async function loadUnread(signal: AbortSignal): Promise<Notification[]> {
  if ((await serverUnreadRows()) === 0) return [];
  const out: Notification[] = [];
  for (let i = 0; i < 3; i++) {
    const page = await listRows({ offset: i * PAGE_ROWS, unreadOnly: true, signal });
    out.push(...page);
    if (page.length < PAGE_ROWS) break;
  }
  return out;
}

export function useUnreadIndex() {
  const authed = useIsAuthed();
  // The user socket keeps it live (useNotificationSync) and a reconnect re-reads it: no reload on every return to the app.
  return useQuery({ queryKey: notificationKeys.unread, queryFn: ({ signal }) => loadUnread(signal), select: viewOf, enabled: authed, staleTime: 10 * 60_000 });
}

// Unread events, mirrored into the shared badge store by core/push (setBadge("notifications")).
export const useUnreadCount = (): number => useBadge("notifications");
