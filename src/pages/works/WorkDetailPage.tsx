import { useCallback, useRef } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { useWork, useWorksRealtime } from "@/entities/work";
import { WorkDetailSkeleton, WorkDetailView } from "@/widgets/work-detail";
import { WorksGuest } from "@/widgets/works";
import { AdminPage } from "@/shared/ui/admin";
import { ErrorView } from "@/shared/ui";
import { useRaPage } from "@/shared/remote-assist";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /works/[id] — one work (TZ 15): assignee, timeline, payment, chat/call hand-offs,
// files, complaint and the server-driven rating window. `id` is the public work id.
export function WorkDetailPage() {
  const { t } = useT();
  const insets = useInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authed = useIsAuthed();
  const q = useWork(id ?? "");
  const { refetch } = q;
  const seen = useRef(false);
  useWorksRealtime();
  useRaPage("client.my_works"); // remote assistance: the operator sees which page the client is on
  // Back from the rating / chat screens: the server may have changed the work.
  useFocusEffect(useCallback(() => {
    if (seen.current) void refetch();
    seen.current = true;
  }, [refetch]));
  const work = q.data?.work;
  return (
    <AdminPage title={t("cl4.title")} subtitle={work?.workId || id}>
      {!authed ? <WorksGuest /> : q.isLoading ? <WorkDetailSkeleton /> : q.isError ? <ErrorView error={q.error} onRetry={() => void refetch()} /> : q.data ? (
        <WorkDetailView detail={q.data} fetchedAt={q.dataUpdatedAt} refreshing={q.isRefetching} onRefresh={() => void refetch()} bottom={insets.bottom + 24} />
      ) : null}
    </AdminPage>
  );
}
