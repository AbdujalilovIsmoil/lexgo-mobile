import { useMemo, useState } from "react";
import { View } from "react-native";
import { ChipBar, DateRangeBar, PagedList, useDateRange } from "@/shared/ui/admin";
import { AdminCallRow, useAdminCalls } from "@/entities/call";
import { useT } from "@/shared/i18n";
import { AdminMeetingSheet } from "./AdminMeetingSheet";

const PAGE = 30;
const STATUSES = ["", "active", "ended", "expired", "cancelled"];

// Every meeting on the platform (superadmin / leads.manage): status chips, date range, detail sheet.
export function PlatformMeetings() {
  const { t } = useT();
  const bar = useDateRange("all");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const filter = useMemo(() => ({ status, from: bar.range.from, to: bar.range.to }), [status, bar.range.from, bar.range.to]);
  const q = useAdminCalls(filter, true);
  const rows = useMemo(() => [...(q.data ?? [])].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)), [q.data]);
  const paged = { isLoading: q.isLoading, isError: q.isError, error: q.error, refetch: q.refetch, isRefetching: q.isRefetching, hasNextPage: shown < rows.length, fetchNextPage: () => setShown((n) => n + PAGE), isFetchingNextPage: false };
  return (
    <>
      <PagedList
        data={rows.slice(0, shown)}
        query={paged}
        keyExtractor={(c) => c.id}
        renderItem={(c) => <AdminCallRow item={c} onPress={() => setOpen(c.id)} />}
        empty={{ icon: "video", title: t("admMeet.platformEmpty"), text: t("admMeet.platformEmptyText") }}
        header={
          <View style={{ gap: 10, marginBottom: 12 }}>
            <DateRangeBar bar={bar} withAll />
            <ChipBar options={STATUSES.map((v) => ({ value: v, label: v ? t(`admMeet.cs.${v}`) : t("adm.all") }))} value={status} onChange={(v) => { setStatus(v); setShown(PAGE); }} />
          </View>
        }
      />
      <AdminMeetingSheet id={open} onClose={() => setOpen(null)} />
    </>
  );
}
