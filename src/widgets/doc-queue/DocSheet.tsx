import { StyleSheet, View } from "react-native";
import { BottomSheet, ErrorView, Icon, SheetScroll, Skeleton, Text, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { actionOf, docCan, factsOf, filesOf, mainFile, useDoc, useDocRating, type DocReq, type SheetAction } from "@/entities/doc-queue";
import { useClaim, useFileShare } from "@/features/doc-pool";
import { Block } from "./Block";
import { DocBlock } from "./DocBlock";
import { DocSheetBar } from "./DocSheetBar";
import { DocSheetFacts } from "./DocSheetFacts";
import { DocSheetHead } from "./DocSheetHead";
import { SheetNeed } from "./SheetNeed";
import { SheetTimeline } from "./SheetTimeline";
import { DocSheetFiles } from "./DocSheetFiles";

type Props = {
  id: string;
  row?: DocReq; // the list's live row: the header shows at once while the full record loads
  visible: boolean;
  onClose: () => void;
  onDetail: (id: string) => void;
  onEditor: (id: string) => void;
  onTransfer: (d: DocReq) => void;
};

// Tap on a request card: a bottom sheet with its facts, what the client asked, the files and a sticky bar (download ·
// details · one contextual action). The record is read by id from the live query (never a copy), so realtime events,
// a claim or a transfer update it while it is open.
export function DocSheet({ id, row, visible, onClose, onDetail, onEditor, onTransfer }: Props) {
  const { t } = useT();
  const access = useAccess();
  const me = useSession()?.user.id ?? "";
  const q = useDoc(id);
  const doc = q.data;
  const head = doc ?? row;
  const rating = useDocRating(doc?.documentRequestId ?? "", doc?.status === "completed");
  const dl = useFileShare();
  const claim = useClaim((cid) => onEditor(cid));
  const c = useColors();
  const can = doc ? docCan(doc, me, access.callCenterLawyer) : null;
  const files = doc ? filesOf(doc) : [];
  const main = doc ? mainFile(doc) : null;
  const action = can ? actionOf(can) : null;
  const run = (a: SheetAction) => { if (a === "claim") claim.mutate(id); else if (a === "editor") onEditor(id); else if (a === "transfer" && doc) onTransfer(doc); };
  const r = rating.data;
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={[0.62, 0.92]}>
      <View style={s.fill}>
        <SheetScroll>
          {head ? <DocSheetHead doc={head} onClose={onClose} /> : null}
          {q.isError && !doc ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : null}
          {q.isLoading ? <View style={s.gap}><Skeleton height={150} round={14} /><Skeleton height={110} round={14} /></View> : null}
          {doc ? (
            <>
              <DocBlock doc={doc} />
              <Block title={t("proDocSheet.progressTitle")}><SheetTimeline status={doc.status} /></Block>
              <Block title={t("proDocSheet.needTitle")}><SheetNeed doc={doc} /></Block>
              <Block title={t("proDocSheet.factsTitle")}><DocSheetFacts facts={factsOf(doc).filter((x) => x.key !== "client")} /></Block>
              {files.length ? (
                <Block title={t("proDocSheet.filesTitle")}><DocSheetFiles files={files} busy={dl.busy} onPick={(f) => void dl.share(f)} /></Block>
              ) : null}
              {r && (r.submitted || r.available) ? (
                <Block title={t("proDocSheet.ratingTitle")}>
                  <View style={s.stars}>
                    {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={22} color={r.submitted && n <= r.stars ? "#F59E0B" : c.line} />)}
                  </View>
                  <Text variant="small" tone="gray">{r.submitted ? r.comment || `${r.stars}/5` : t("ad1.ratingNone")}</Text>
                </Block>
              ) : null}
            </>
          ) : null}
        </SheetScroll>
        <DocSheetBar
          hasFile={!!main}
          action={action}
          busy={!!dl.busy}
          acting={claim.isPending}
          onDownload={() => (main ? void dl.share(main.file) : toast(t("proDocSheet.noFile"), "info"))}
          onAction={() => run(action)}
          onDetail={() => onDetail(id)}
        />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  stars: { flexDirection: "row", gap: 4 },
  gap: { gap: 12 },
});
