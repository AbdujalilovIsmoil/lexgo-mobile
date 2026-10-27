import { useCallback, useState } from "react";
import { pickDocuments, pickImages, type PickOut } from "@/shared/lib/upload";
import { checkAttach, LIMITS, type Attach, type AttachError } from "@/entities/duty-request";
import { useFileRules } from "./useFileRules";

export type AttachNote = AttachError | "tooMany" | null;

// Files and voice notes of a request: picked, validated on the phone (the size limit from the document service settings), removable.
export function useAttachments() {
  const rule = useFileRules().attach;
  const [files, setFiles] = useState<Attach[]>([]);
  const [voices, setVoices] = useState<Attach[]>([]);
  const [note, setNote] = useState<AttachNote>(null);

  const addFiles = useCallback((list: Attach[]) => {
    const bad = list.map((f) => checkAttach(f, "file", rule)).find(Boolean) ?? null;
    if (bad) return setNote(bad);
    setNote(files.length + list.length > LIMITS.maxFiles ? "tooMany" : null);
    setFiles((cur) => [...cur, ...list].slice(0, LIMITS.maxFiles));
  }, [files.length, rule]);

  const take = (out: PickOut) => {
    if (!out) return;
    if (out.error) return setNote(out.error);
    addFiles(out.files);
  };

  const addVoice = useCallback((v: Attach) => {
    const bad = checkAttach(v, "voice");
    if (bad) return setNote(bad);
    setNote(voices.length >= LIMITS.maxVoices ? "tooMany" : null);
    setVoices((cur) => [...cur, v].slice(0, LIMITS.maxVoices));
  }, [voices.length]);

  return {
    files, voices, note, rule,
    pickFile: async () => take(await pickDocuments({ multiple: true, maxMb: rule.mb })),
    pickPhoto: async () => take(await pickImages({ multiple: true, maxMb: rule.mb })),
    addVoice,
    removeFile: (i: number) => setFiles((cur) => cur.filter((_, j) => j !== i)),
    removeVoice: (i: number) => setVoices((cur) => cur.filter((_, j) => j !== i)),
    reset: () => { setFiles([]); setVoices([]); setNote(null); },
  };
}
