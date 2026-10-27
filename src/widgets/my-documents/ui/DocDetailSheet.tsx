import { StyleSheet, View } from "react-native";
import { BottomSheet, ErrorView, SheetScroll, Skeleton, Text, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useDocSettings } from "@/entities/doc-settings";
import { actionOf, answersPeek, docCan, downloadOf, factsOf, flowOf, groupOf, useDoc, useDocPolicy, useDocVersions, type DocRow, type SheetAction } from "@/entities/my-document";
import { AdvocateCard, RatingCard, usePay, useShare } from "@/features/my-documents";
import { DocFacts } from "./DocFacts";
import { DocSheetAnswers } from "./DocSheetAnswers";
import { DocSheetBar, noFileText } from "./DocSheetBar";
import { DocSheetHead } from "./DocSheetHead";
import { SheetBlock } from "./SheetBlock";
import { StatusTimeline } from "./StatusTimeline";

type Props = {
  id: string;
  row?: DocRow; // the list's live row: shows the header at once while the full document loads
  visible: boolean;
  onClose: () => void;
  onDetail: (id: string) => void;
  onSend: (id: string) => void;
  onRate: (id: string) => void;
};

// Tap on a card: a bottom sheet with the document's flow, key facts, answers, advocate and rating, and a sticky bar with
// download · details · one contextual action. The document is read by id from the live query (never a copy), so
// realtime events and payments update it while it is open. The document service settings (TZ.md §4) close a download format
// and take the review away when the platform switched that mode off.
export function DocDetailSheet({ id, row, visible, onClose, onDetail, onSend, onRate }: Props) {
  const { t } = useT();
  const ds = useDocSettings();
  const q = useDoc(id);
  const doc = q.data;
  const policy = useDocPolicy(id, !!doc).data;
  const versions = useDocVersions(id).data?.length ?? 0;
  const dl = useShare();
  const pay = usePay(doc ?? { id, price: 0 });
  const head = doc ?? row;
  const can = doc ? docCan(doc, policy, ds.gate("review").state === "off") : null;
  const plan = doc && can ? downloadOf(doc, can, policy, ds.downloadOk) : null;
  const action = doc && can ? actionOf(doc, can) : null;
  const steps = doc ? flowOf(doc) : null;
  const group = doc ? groupOf(doc.status) : "closed";
  const run = (a: SheetAction) => (a === "pay" ? pay.mutate() : a === "rate" ? onRate(id) : a === "review" ? onSend(id) : undefined);
  const download = () => { if (plan?.file) void dl.share(plan.file); else toast(noFileText(t, plan?.reason), "info"); };
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={[0.72, 0.94]}>
      <View style={s.fill}>
        <SheetScroll>
          {head ? <DocSheetHead row={head} onClose={onClose} /> : null}
          {q.isError && !doc ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : null}
          {q.isLoading ? <View style={s.gap}><Skeleton height={120} round={14} /><Skeleton height={150} round={14} /><Skeleton height={110} round={14} /></View> : null}
          {doc && can ? (
            <>
              {steps ? (
                <SheetBlock title={t("docSheet.progress")}>
                  {group !== "closed" ? <Text variant="small" tone={group === "ready" ? "ok" : "ink"}>{t(`dm2.next.${group}`)}</Text> : null}
                  <StatusTimeline steps={steps} paid={doc.paid || policy?.paid === true} />
                </SheetBlock>
              ) : null}
              <SheetBlock title={t("docSheet.facts")}><DocFacts facts={factsOf(doc, versions)} /></SheetBlock>
              <DocSheetAnswers peek={answersPeek(doc)} />
              {can.advocate && doc.lawyer ? <AdvocateCard doc={doc} /> : null}
              <RatingCard rating={doc.rating} workId={doc.workId} onRate={() => onRate(id)} />
              {!can.review && doc.lawyerActive && doc.blockReason ? <Text variant="caption" tone="gray">{doc.blockReason}</Text> : null}
            </>
          ) : null}
        </SheetScroll>
        <DocSheetBar plan={plan} action={action} busy={dl.busy} paying={pay.isPending} onDownload={download} onAction={() => run(action)} onDetail={() => onDetail(id)} />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, gap: { gap: 12 } });
