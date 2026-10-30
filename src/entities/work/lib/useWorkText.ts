import { useCallback, useMemo } from "react";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import type { WorkGroup, WorkKind } from "../model/types";

// Server hints ("next_action") arrive in Uzbek only; known ones are translated.
const NEXT: Record<string, string> = {
  "Xulosa bilan tanishing": "readConclusion",
  "Natijani ko'ring va baholang": "viewAndRate",
  "So'rov holatini kuzating": "followRequest",
  "Tayyor hujjatni yuklab oling": "downloadDoc",
  "Advokat ish jarayonini kuzating": "followLawyer",
  "Callcenter operator shikoyatni tekshiradi": "operatorReviews",
};

// Translated names of kinds, groups and statuses; unknown statuses fall back to the
// server's own label, then to a tidied slug.
export function useWorkText() {
  const { t } = useT();
  const status = useCallback(
    (s: string, backend = "") => {
      for (const k of [`cl2.s.${s}`, `cl3.s.${s}`]) if (t(k) !== k) return t(k);
      return backend || humanizeSlug(s);
    },
    [t],
  );
  const next = useCallback((raw: string) => (NEXT[raw] ? t(`cl5.next.${NEXT[raw]}`) : raw), [t]);
  const kind = useCallback((k: WorkKind) => t(`cl1.kind.${k}`), [t]);
  const group = useCallback((g: WorkGroup | "open" | "running" | "all") => t(`cl1.group.${g}`), [t]);
  return useMemo(() => ({ status, next, kind, group }), [status, next, kind, group]);
}
