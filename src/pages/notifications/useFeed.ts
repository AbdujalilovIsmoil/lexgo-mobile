import { useEffect, useMemo, useState } from "react";
import { eventText, NOTIF_CATEGORIES, useNotifications, useUnreadIndex, type NotifCategory, type Notification } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { useSearchTerm } from "@/shared/perf";

export type CatFilter = NotifCategory | "all";
const MAX_ROWS = 800; // stop auto-loading older pages here; "load more" still works

// Filters run over what is loaded (the backend stores every event as category "system", so the
// category is derived on the device). While a filter leaves the list short, older pages are fetched.
export function useFeed() {
  const { t } = useT();
  const list = useNotifications();
  const unread = useUnreadIndex();
  const [cat, setCat] = useState<CatFilter>("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [onlyRead, setOnlyRead] = useState(false);
  const search = useSearchTerm();
  const term = search.term.toLowerCase();
  const source = onlyUnread ? unread.data?.items : list.data?.items;
  const items = useMemo(() => {
    const has = (n: Notification) => {
      const x = eventText(n, t);
      return `${x.title} ${x.body}`.toLowerCase().includes(term);
    };
    return (source ?? []).filter((n) => (cat === "all" || n.category === cat) && (!onlyRead || n.read) && (!term || has(n)));
  }, [source, cat, term, t, onlyRead]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  const loaded = list.data?.rows.length ?? 0;
  const thin = (cat !== "all" || !!term) && !onlyUnread && items.length < 10;
  useEffect(() => {
    if (thin && hasNextPage && !isFetchingNextPage && loaded < MAX_ROWS) void fetchNextPage();
  }, [thin, hasNextPage, isFetchingNextPage, loaded, fetchNextPage]);

  const counts = useMemo(() => {
    const out = Object.fromEntries(NOTIF_CATEGORIES.map((c) => [c, 0])) as Record<NotifCategory, number>;
    for (const n of unread.data?.items ?? []) out[n.category] += 1;
    return out;
  }, [unread.data]);
  const unreadTotal = unread.data?.items.length ?? 0;
  return { list, items, cat, setCat, onlyUnread, setOnlyUnread: (v: boolean) => { setOnlyUnread(v); if (v) setOnlyRead(false); }, onlyRead, setOnlyRead: (v: boolean) => { setOnlyRead(v); if (v) setOnlyUnread(false); }, search, counts, unreadTotal, filtering: cat !== "all" || !!term || onlyUnread || onlyRead, more: onlyUnread ? false : !!hasNextPage };
}
