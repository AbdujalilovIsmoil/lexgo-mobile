import { useRouter } from "expo-router";
import { create } from "zustand";
import { FILE_RULE, type PickedDoc } from "@/entities/doc-analysis";
import { pickRule, useDocSettings } from "@/entities/doc-settings";
import { useT } from "@/shared/i18n";
import { pickDocuments } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";

// A file picked somewhere else (Home's paper clip) for the analysis screen to start with; the screen takes it once.
type State = { file: PickedDoc | null; set: (file: PickedDoc | null) => void };
export const usePendingDoc = create<State>((set) => ({ file: null, set: (file) => set({ file }) }));
export const takePendingDoc = (): PickedDoc | null => {
  const f = usePendingDoc.getState().file;
  if (f) usePendingDoc.getState().set(null);
  return f;
};

// Pick a document under the analysis rules (formats, size from the document service settings) and open the analysis with it. The AI chat
// itself takes text only (POST …/messages is { content }), so a file goes to the AI document analysis.
export function usePickForAnalysis() {
  const { t } = useT();
  const router = useRouter();
  const ds = useDocSettings();
  const rule = pickRule(ds.upload(FILE_RULE));
  return async () => {
    const r = await pickDocuments({ types: rule.types, exts: rule.exts, maxMb: rule.maxMb });
    if (!r) return;
    if (r.error) return toast(r.error === "tooBig" ? t("docs.tooBig", { mb: rule.maxMb }) : t("dset.badType", { types: rule.label }), "err");
    if (!r.files[0]) return;
    usePendingDoc.getState().set(r.files[0]);
    router.push("/doc-analysis");
  };
}
