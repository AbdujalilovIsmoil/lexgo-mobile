import { useEffect, useRef, useState } from "react";
import { useUserEvents } from "@/shared/realtime";
import { saveDraft } from "@/entities/doc-queue";

export type Save = { state: "idle" | "saving" | "saved" | "error"; at: string };
const IDLE: Save = { state: "idle", at: "" };
const PING_MS = 4000;

// Save status of the open document. The editor reports "modified" (true) and "saved" (false);
// the backend's `editor_saved` event confirms each autosave. After the editor settles, the draft is
// touched on the server (PUT …/editor/draft) so its last-saved time stays current.
export function useSaveState(id: string) {
  const [save, setSave] = useState<Save>(IDLE);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touched = useRef(false); // the editor also reports "saved" while opening; only count real edits
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents("document_request.editor_saved", (e) => {
    const at = typeof e.saved_at === "string" ? e.saved_at : new Date().toISOString();
    if (e.record_id === id) setSave((p) => ({ state: p.state === "saving" ? "saving" : "saved", at }));
  });
  const ping = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveDraft(id).then((r) => r.savedAt && setSave((p) => ({ ...p, at: r.savedAt }))).catch(() => {}), PING_MS);
  };
  return {
    save,
    onDirty: (dirty: boolean) => {
      clearTimeout(timer.current);
      if (dirty) {
        touched.current = true;
        setSave((p) => ({ state: "saving", at: p.at }));
      } else if (touched.current) {
        setSave({ state: "saved", at: new Date().toISOString() });
        ping();
      }
    },
    onError: () => setSave((p) => ({ ...p, state: "error" })),
    reset: () => {
      touched.current = false;
      setSave(IDLE);
    },
  };
}
