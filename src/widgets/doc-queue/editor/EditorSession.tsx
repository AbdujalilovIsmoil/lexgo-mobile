import { useState } from "react";
import { View } from "react-native";
import { ActionList } from "@/shared/ui/admin";
import { FilePreview } from "@/shared/ui/preview";
import { useKept } from "@/shared/lib/useKept";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { docCan, type DocFile, type DocReq } from "@/entities/doc-queue";
import { FinalizeSheet, FulfillSheet, SourceSheet, useEditorSession, useLiveCall, useSaveState, type EditorMsg } from "@/features/doc-editor";
import { TransferSheet } from "@/features/doc-pool";
import { useDocMenu } from "../useDocMenu";
import { EditorBar } from "./EditorBar";
import { EditorPane } from "./EditorPane";
import { InfoSheet } from "./InfoSheet";
import { ScreenGuard } from "./ScreenGuard";
import { useLeave } from "./useLeave";

type Sheet = "" | "menu" | "info" | "source" | "send" | "transfer" | "upload";

// The editing screen: header, OnlyOffice WebView and the sheets around it (info, source, send, transfer…).
export function EditorSession({ doc, onSent }: { doc: DocReq; onSent: () => void }) {
  const me = useSession()?.user.id ?? "";
  const ccl = useAccess().callCenterLawyer;
  const can = docCan(doc, me, ccl);
  const { save, onDirty, onError, reset } = useSaveState(doc.id);
  const s = useEditorSession(doc.id, true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("");
  const [file, setFile] = useState<DocFile | null>(null);
  const shown = useKept(file);
  const live = useLiveCall(doc.chatRoomId, sheet === "menu");
  const leave = useLeave(save.state === "saving");
  const reopen = () => { setReady(false); setFailed(false); reset(); s.reopen(); };
  const onMsg = (m: EditorMsg) => (m.t === "ready" ? setReady(true) : m.t === "dirty" ? onDirty(m.d === true) : m.t === "error" ? onError() : m.t === "fail" ? setFailed(true) : null);
  const menu = useDocMenu(doc, can, live.data ?? "", { info: () => setSheet("info"), source: () => setSheet("source"), transfer: () => setSheet("transfer"), upload: () => setSheet("upload") });
  const preview = (f: DocFile) => { setSheet(""); setTimeout(() => setFile(f), 320); };
  return (
    <View style={{ flex: 1 }}>
      <ScreenGuard />
      <EditorBar doc={doc} save={save} canSend={ready && !failed && save.state !== "saving"} onBack={leave} onMenu={() => setSheet("menu")} onSend={() => setSheet("send")} />
      <EditorPane doc={doc} s={s} ready={ready} failed={failed} onMsg={onMsg} onRetry={reopen} />
      <ActionList visible={sheet === "menu"} onClose={() => setSheet("")} title={doc.title} actions={menu} />
      <InfoSheet doc={doc} visible={sheet === "info"} onClose={() => setSheet("")} onFile={preview} />
      <SourceSheet id={doc.id} visible={sheet === "source"} onClose={() => setSheet("")} onChanged={reopen} />
      <FinalizeSheet doc={doc} save={save} visible={sheet === "send"} onClose={() => setSheet("")} onSent={onSent} />
      <TransferSheet doc={sheet === "transfer" ? doc : null} pool={ccl && doc.assignedId !== me} onClose={() => setSheet("")} onDone={leave} />
      <FulfillSheet doc={doc} visible={sheet === "upload"} onClose={() => setSheet("")} onSent={onSent} />
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={shown && { path: shown.path, name: shown.name, mime: shown.mime }} />
    </View>
  );
}
