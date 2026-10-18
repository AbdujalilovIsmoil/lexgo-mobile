import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { pageMyApprovals, pageMyAttendance, pageMyMessages, pageMyTasks, type SelfPage } from "../api/selfPaged";
import { hrmKey } from "./keys";

type Fetch<T> = (offset: number) => Promise<SelfPage<T>>;

// Infinite list over server pages; rows are de-duplicated by id so a shifting list never repeats a row.
function usePages<T extends { id: string }>(key: unknown[], fetch: Fetch<T>) {
  const q = useInfiniteQuery({
    queryKey: hrmKey(...key), queryFn: ({ pageParam }) => fetch(pageParam), initialPageParam: 0, getNextPageParam: (last) => last.next ?? undefined,
    select: (d) => { const seen = new Set<string>(); return d.pages.flatMap((p) => p.items).filter((x) => !seen.has(x.id) && !!seen.add(x.id)); },
  });
  return { items: q.data ?? [], query: q };
}

export const useTasksPaged = (q: string, status: string) => usePages(["p-tasks", q, status], (o) => pageMyTasks(q, status, o));
export const useMessagesPaged = (unread: boolean) => usePages(["p-messages", unread], (o) => pageMyMessages(unread, o));
export const useApprovalsPaged = (status: string) => usePages(["p-approvals", status], (o) => pageMyApprovals(status, o));
export const useAttendancePaged = (from: string, to: string) => usePages(["p-attendance", from, to], (o) => pageMyAttendance(from, to, o));

// Dashboard sources: open tasks and unread messages (up to 100 each, for the counters and the top-5 lists).
export const useDashTasks = () => useQuery({ queryKey: hrmKey("dash-tasks"), queryFn: async () => (await pageMyTasks("", "", 0, 100)).items });
export const useDashUnread = () => useQuery({ queryKey: hrmKey("dash-unread"), queryFn: async () => (await pageMyMessages(true, 0, 100)).items });
