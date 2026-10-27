import { useMemo } from "react";
import { pickRule, useDocSettings } from "@/entities/doc-settings";
import { attachRule, LIMITS, type FileRule } from "@/entities/duty-request";

// The request's file rules (TZ.md §4): every file takes the document service's size limit, and the document an advocate is to check
// (`main`) takes only the formats it publishes. Until the settings are in, offline or after an error, the phone's own list and 25 MB stay.
export function useFileRules(): { main: FileRule; attach: FileRule } {
  const s = useDocSettings().settings;
  return useMemo(() => {
    const attach = attachRule(s?.maxFileMb ?? LIMITS.fileMb);
    if (!s?.formats) return { main: attach, attach };
    const p = pickRule({ mb: attach.mb, formats: s.formats });
    return { main: { mb: attach.mb, exts: p.exts, list: p.label }, attach };
  }, [s]);
}
