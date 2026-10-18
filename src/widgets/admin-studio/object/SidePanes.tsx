import { View } from "react-native";
import { Card, EmptyState } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";
import { useComments, useStudioText, type StudioVersion } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";
import { CommentsPane } from "./CommentsPane";
import { FilePane } from "./FilePane";
import { StepsPane } from "./StepsPane";
import { VersionsPane } from "./VersionsPane";

export type SideTab = "versions" | "comments" | "file" | "steps";
type Props = { ws: Workspace; tab: SideTab; onTab: (t: SideTab) => void; onRollback: (v: StudioVersion) => void; onPreview: (v: StudioVersion) => void };

// Versions · comments · file · approval steps of a saved object, as tabs under the editor.
export function SidePanes({ ws, tab, onTab, onRollback, onPreview }: Props) {
  const { t } = useStudioText();
  const comments = useComments(ws.id).data;
  const d = ws.detail;
  if (ws.creating || !d) return <Card><EmptyState compact icon="edit-3" title={t("admStudioB.side.newTitle")} text={t("admStudioB.side.newText")} /></Card>;
  const opts = [
    { value: "versions" as SideTab, label: t("admStudioB.side.versions"), count: d.versions.length },
    { value: "comments" as SideTab, label: t("admStudioB.side.comments"), count: comments?.length },
    { value: "file" as SideTab, label: t("admStudioB.side.file") },
    { value: "steps" as SideTab, label: t("admStudioB.side.steps") },
  ].map((o) => (o.count ? o : { value: o.value, label: o.label }));
  return (
    <View style={{ gap: 12 }}>
      <View style={{ marginHorizontal: -16 }}><ChipBar options={opts} value={tab} onChange={onTab} /></View>
      {tab === "versions" ? <VersionsPane detail={d} canRollback={ws.access.canPublish && ws.status !== "archived"} canExport={ws.access.canReview} busy={ws.busy !== ""} onRollback={onRollback} onPreview={onPreview} /> : null}
      {tab === "comments" ? <CommentsPane id={ws.id} canWrite={ws.access.any && ws.status !== "archived"} versionLabel={(vid) => d.versions.find((v) => v.id === vid)?.version ?? ""} /> : null}
      {tab === "file" ? <FilePane ws={ws} /> : null}
      {tab === "steps" ? <StepsPane steps={d.steps} approvalFree={ws.approvalFree} submitted={ws.status === "submitted" || ws.status === "in_review"} /> : null}
    </View>
  );
}
