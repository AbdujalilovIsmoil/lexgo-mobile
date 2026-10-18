import { View } from "react-native";
import { ErrorView } from "@/shared/ui";
import { KeyboardLift } from "@/shared/ui/admin";
import { ApiError } from "@/shared/api";
import type { DocReq } from "@/entities/doc-queue";
import { EditorWebView, useEditorSession, type EditorMsg } from "@/features/doc-editor";
import { ClaimGate } from "./ClaimGate";
import { EditorFallback } from "./EditorFallback";
import { EditorLoading } from "./EditorLoading";

type Props = { doc: DocReq; s: ReturnType<typeof useEditorSession>; ready: boolean; failed: boolean; onMsg: (m: EditorMsg) => void; onRetry: () => void };

// What fills the screen under the header: loading, claim-first, error, the no-editor fallback, or the live editor.
export function EditorPane({ doc, s, ready, failed, onMsg, onRetry }: Props) {
  if (s.isLoading) return <EditorLoading onRetry={onRetry} />;
  if (s.isError || !s.data) {
    return s.error instanceof ApiError && s.error.status === 409 ? <ClaimGate doc={doc} /> : <View style={{ flex: 1, justifyContent: "center" }}><ErrorView error={s.error} onRetry={onRetry} /></View>;
  }
  if (!s.data.configured || failed) return <EditorFallback doc={doc} fileUrl={s.data.fileUrl} onRetry={onRetry} reason={failed ? "failed" : "off"} />;
  return (
    <KeyboardLift>
      <EditorWebView key={s.data.sessionId} session={s.data} onMsg={onMsg} />
      {ready ? null : <EditorLoading onRetry={onRetry} />}
    </KeyboardLift>
  );
}
