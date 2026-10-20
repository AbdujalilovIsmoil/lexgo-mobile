import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, IconButton } from "@/shared/ui";
import { PagedList, useDateRange } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { AdminCallRow, useAdminCalls } from "@/entities/call";
import { useT } from "@/shared/i18n";
import { AdminMeetingSheet } from "./AdminMeetingSheet";
import { MeetingsFilterSheet } from "./MeetingsFilterSheet";

const PAGE = 30;

// Every meeting on the platform (superadmin / leads.manage): one filter button (status and period live in a sheet), what is
// applied shows as chips that can be removed one by one, detail sheet.
export function PlatformMeetings() {
  const { t, locale } = useT();
  const bar = useDateRange("all");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const [filters, setFilters] = useState(false);
  const filter = useMemo(() => ({ status, from: bar.range.from, to: bar.range.to }), [status, bar.range.from, bar.range.to]);
  const q = useAdminCalls(filter, true);
  const rows = useMemo(() => [...(q.data ?? [])].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)), [q.data]);
  const day = (k: string) => fmtDate(`${k}T12:00:00`, locale);
  const period = bar.preset === "all" ? "" : bar.preset === "custom" ? [bar.from && day(bar.from), bar.to && day(bar.to)].filter(Boolean).join(" – ") || t("adm.custom") : t(`adm.${bar.preset}`);
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
          <View style={s.head}>
            <View style={s.row}>
              <View style={s.chips}>
                {status ? <Chip label={t(`admMeet.cs.${status}`)} active icon="x" onPress={() => { setStatus(""); setShown(PAGE); }} /> : null}
                {period ? <Chip label={period} active icon="x" onPress={() => { bar.setPreset("all"); setShown(PAGE); }} /> : null}
              </View>
              <IconButton icon="sliders" label={t("dm11.filters")} badge={!!status || bar.preset !== "all"} onPress={() => setFilters(true)} />
            </View>
          </View>
        }
      />
      <AdminMeetingSheet id={open} onClose={() => setOpen(null)} />
      <MeetingsFilterSheet visible={filters} onClose={() => setFilters(false)} status={status} onStatus={(v) => { setStatus(v); setShown(PAGE); }} bar={bar} />
    </>
  );
}

const s = StyleSheet.create({
  head: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
