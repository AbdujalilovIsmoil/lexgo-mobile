import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useComments, useStudioText } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";
import { Banner } from "./Banner";
import { ErrorSummary } from "./ErrorSummary";
import { reviewNoteOf } from "./reviewNote";

// Everything the user should read before editing: stale copy, reviewer note, state of the work, errors.
export function ObjectBanners({ ws, error, onFile, onReload }: { ws: Workspace; error: string; onFile: () => void; onReload: () => void }) {
  const { t, locale } = useStudioText();
  const router = useRouter();
  const comments = useComments(ws.id).data ?? [];
  const note = ws.status === "changes_requested" ? reviewNoteOf(ws.detail, comments) : null;
  const canEdit = ws.access.canEdit;
  const waiting = ws.status === "submitted" || ws.status === "in_review";
  return (
    <View style={{ gap: 10 }}>
      {error ? <Banner tone="err" icon="alert-circle" title={t("admStudioB.failed")} text={error} /> : null}
      {ws.remote ? <Banner tone="warn" icon="refresh-cw" title={t("admStudioB.remote.title")} text={t("admStudioB.remote.text")}><Button title={t("admStudioB.remote.load")} size="sm" variant="line" onPress={onReload} /></Banner> : null}
      {note ? <Banner tone="warn" icon="rotate-ccw" title={t(note.rejected ? "admStudioB.banner.rejected" : "admStudioB.banner.changes")} text={`“${note.text}”${note.by ? ` — ${note.by}` : ""}${note.at ? ` · ${fmtDateTime(note.at, locale)}` : ""}`} /> : null}
      {ws.status === "changes_requested" && !note && canEdit ? <Banner tone="warn" icon="rotate-ccw" title={t("admStudioB.banner.changes")} text={t("admStudioB.banner.changesNoNote")} /> : null}
      {ws.status === "published" && canEdit ? <Banner tone="info" icon="upload-cloud" title={t("admStudioB.banner.published")} text={t("admStudioB.banner.publishedText")} /> : null}
      {ws.status === "approved" ? <Banner tone="ok" icon="check-circle" title={t("admStudioB.banner.approved")} text={t(ws.access.canPublish && !ws.approvalFree ? "admStudioB.banner.approvedPublisher" : "admStudioB.banner.approvedWait")} /> : null}
      {waiting ? (
        <Banner tone="info" icon="clock" title={t("admStudioB.banner.review")} text={t("admStudioB.banner.reviewText")}>
          {ws.access.canReview ? <Button title={t("admStudioB.openReview")} icon="check-square" size="sm" variant="soft" onPress={() => router.push("/manage/studio/approvals" as never)} /> : null}
        </Banner>
      ) : null}
      {!canEdit && ws.status !== "archived" ? <Banner tone="info" icon="lock" title={t("admStudioB.banner.viewOnly")} text={t("admStudioB.banner.viewOnlyText")} /> : null}
      {ws.uploadMode && !ws.hasFile && !ws.readOnly ? (
        <Banner tone="warn" icon="paperclip" title={t("admStudioB.banner.fileNeeded")} text={t(ws.creating ? "admStudioB.banner.fileNeededNew" : "admStudioB.banner.fileNeededText")}>
          {ws.creating ? null : <Button title={t("admStudioB.side.file")} icon="paperclip" size="sm" variant="line" onPress={onFile} />}
        </Banner>
      ) : null}
      <ErrorSummary errors={ws.errors} ctorFields={ws.ctor?.fields ?? []} />
    </View>
  );
}
