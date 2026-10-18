import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { FilePreview } from "@/shared/ui/preview";
import { Button, EmptyState, Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { WorkDetail, WorkFile } from "@/entities/work";
import { useWorkNav } from "@/features/work-actions";
import { WorkComplaintsCard } from "./WorkComplaintsCard";
import { WorkFilesCard } from "./WorkFilesCard";
import { WorkHead } from "./WorkHead";
import { WorkInfoCard } from "./WorkInfoCard";
import { WorkNext } from "./WorkNext";
import { WorkPaymentCard } from "./WorkPaymentCard";
import { WorkPeopleCard } from "./WorkPeopleCard";
import { WorkRatingCard } from "./WorkRatingCard";
import { WorkTimeline } from "./WorkTimeline";

type Props = { detail: WorkDetail; fetchedAt: number; refreshing: boolean; onRefresh: () => void; bottom: number };
type Tab = "overview" | "files" | "history";

// A work opened out: the head, the next step and the rating window, then three tabs — overview (people, payment,
// facts, complaints), files, history — so nothing is a long scroll away.
export function WorkDetailView({ detail, fetchedAt, refreshing, onRefresh, bottom }: Props) {
  const { t } = useT();
  const nav = useWorkNav();
  const [tab, setTab] = useState<Tab>("overview");
  const [file, setFile] = useState<WorkFile | null>(null);
  const { work, related } = detail;
  const n = (k: string, c: number) => `${t(`ntd.${k}`)}${c ? ` · ${c}` : ""}`;
  return (
    <>
      <ScrollView contentContainerStyle={[s.body, { paddingBottom: bottom }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
        <WorkHead work={work} />
        <WorkNext action={work.nextAction} />
        {detail.rating ? <WorkRatingCard rating={detail.rating} workId={work.workId} fetchedAt={fetchedAt} onExpire={onRefresh} /> : null}
        <Segmented value={tab} onChange={setTab} options={[{ value: "overview", label: t("ntd.wdOverview") }, { value: "files", label: n("wdFiles", detail.files.length) }, { value: "history", label: n("wdHistory", detail.timeline.length) }]} />
        {tab === "overview" ? (
          <>
            <WorkPeopleCard detail={detail} />
            {detail.payment ? <WorkPaymentCard payment={detail.payment} /> : null}
            <WorkInfoCard detail={detail} />
            <WorkComplaintsCard items={detail.complaints} />
            {related && nav.canOpen(related) ? <Button title={t(`cl4.open.${related.kind}`)} icon="external-link" variant="line" full onPress={() => nav.open(related)} /> : null}
          </>
        ) : tab === "files" ? (detail.files.length ? <WorkFilesCard files={detail.files} onOpen={setFile} /> : <EmptyState icon="paperclip" title={t("ntd.wdNoFiles")} compact />)
          : detail.timeline.length ? <WorkTimeline events={detail.timeline} /> : <EmptyState icon="clock" title={t("ntd.wdNoHistory")} compact />}
      </ScrollView>
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={file ? { path: file.path, name: file.name, mime: file.mime } : null} />
    </>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
});
