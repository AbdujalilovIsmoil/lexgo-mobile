import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { Attach, DutyKind } from "@/entities/duty-request";
import { dutySchema } from "./dutySchema";

export type Missing = "" | "need" | "consent" | "mainFile";
export const LANGS = ["uz-latn", "uz-cyrl", "ru"] as const;

// Text fields of the request form and the "what is still missing" gate (walked top to bottom).
export function useDutyFields(kind: DutyKind) {
  const { t, locale } = useT();
  const form = useAppForm(dutySchema, { title: "", need: "", extra: "" });
  const { need, extra, title } = form.watch();
  const [docType, setDocType] = useState("");
  const [lang, setLang] = useState<string>(locale === "ru" ? "ru" : "uz-latn");
  const [consent, setConsent] = useState(false);
  const [mainFile, setMainFile] = useState<Attach | null>(null);
  const [missing, setMissing] = useState<Missing>("");
  // Counts refused presses, so a section that is still empty is scrolled to again on the next press.
  const [attempt, setAttempt] = useState(0);

  // The gate, top to bottom: the file (review), the written fields (react-hook-form shows their messages), then the consent.
  const check = async (): Promise<boolean> => {
    const file: Missing = kind === "review" && !mainFile ? "mainFile" : "";
    const text = await form.trigger();
    const m: Missing = file || (!text ? "need" : !consent ? "consent" : "");
    setMissing(m);
    if (m) setAttempt((a) => a + 1);
    return !m;
  };
  const clear = (k: Missing) => setMissing((m) => (m === k ? "" : m));

  // The optional note rides along in the same text, as on the web.
  const needText = () => (extra.trim() ? `${need.trim()}\n\n${t("dm7.noteLabel")}: ${extra.trim()}` : need.trim());

  return {
    control: form.control, need, extra, title, docType, lang, consent, mainFile, missing, attempt, check, needText,
    setDocType, setLang,
    setConsent: (v: boolean) => { setConsent(v); if (v) clear("consent"); },
    setMainFile: (f: Attach | null) => { setMainFile(f); if (f) clear("mainFile"); },
  };
}
