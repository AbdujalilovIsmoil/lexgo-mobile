import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { FilePreview } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { docCan, docPath, useDoc, useDocSync, type DocFile } from "@/entities/doc-queue";
import { useStarted } from "@/features/doc-editor";
import { ClaimGate } from "./ClaimGate";
import { ClosedGate } from "./ClosedGate";
import { DoneGate } from "./DoneGate";
import { EditorSession } from "./EditorSession";
import { SourceStage } from "./SourceStage";

// /pro/docs/[id]/editor — take the work if needed → choose the starting source → edit → send to the client.
export function EditorScreen({ id }: { id: string }) {
  const { t } = useT();
  const router = useRouter();
  const q = useDoc(id);
  useDocSync();
  const { started, setStarted } = useStarted(id);
  const [file, setFile] = useState<DocFile | null>(null);
  const me = useSession()?.user.id ?? "";
  const ccl = useAccess().callCenterLawyer;
  const doc = q.data;
  const can = doc && docCan(doc, me, ccl);
  const frame = (body: ReactNode) => <AdminPage title={doc?.title || t("ad5.title")} subtitle={doc?.clientName}>{body}</AdminPage>;
  if (q.isLoading || (doc && can?.editor && started === null)) return frame(<View style={{ padding: 16, gap: 12 }}><Skeleton height={90} round={20} /><Skeleton height={90} round={20} /></View>);
  if (!doc || !can) return frame(<ErrorView error={q.error} onRetry={() => void q.refetch()} />);
  if (can.claim) return frame(<ClaimGate doc={doc} />);
  const files = <FilePreview visible={!!file} onClose={() => setFile(null)} file={file && { path: file.path, name: file.name, mime: file.mime }} />;
  if (!can.editor) return frame(<>{doc.status === "completed" ? <DoneGate doc={doc} onFile={setFile} /> : <ClosedGate doc={doc} upload={can.upload} onRetry={() => void q.refetch()} onFile={setFile} />}{files}</>);
  if (!started) return <SourceStage doc={doc} onStart={() => setStarted(true)} />;
  return <EditorSession doc={doc} onSent={() => router.replace(docPath(id))} />;
}
