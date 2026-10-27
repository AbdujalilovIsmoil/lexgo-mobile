import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { getDocRuntime } from "../api/settingsApi";
import { downloadOk, gateOf, refusalCode, uploadRule } from "../lib/gate";
import type { DocServiceMode, UploadRule } from "./types";

export const dsetKeys = { runtime: ["doc-settings", "runtime"] as const };

// The one reader of the settings for every document screen. Signed in, the answer carries this account's access, and the whole
// cache is dropped at each sign-in / sign-out, so one account's answer never serves another. Not kept on the device: while it
// loads, offline or after an error the screens keep their own defaults.
const useDocRuntime = () => useQuery({ queryKey: dsetKeys.runtime, queryFn: getDocRuntime, staleTime: 5 * 60_000 });

// The settings as screens ask about them; each answer falls back to the screen's old behaviour until the settings are in.
export function useDocSettings() {
  const rt = useDocRuntime().data;
  return useMemo(() => ({
    settings: rt?.settings,
    gate: (mode: DocServiceMode) => gateOf(rt, mode),
    // A chooser's ways: a mode switched off for everybody is dropped, the rest carry their gate (a locked one shows its reason).
    offer: <T extends { mode: DocServiceMode }>(items: T[]) =>
      items.flatMap((i) => {
        const gate = gateOf(rt, i.mode);
        return gate.state === "off" ? [] : [{ ...i, gate }];
      }),
    upload: (own: UploadRule) => uploadRule(rt, own),
    includedPages: (own: number) => rt?.settings.includedPages ?? own,
    downloadOk: (format: string) => downloadOk(rt, format),
  }), [rt]);
}

// A refused document action in plain words, or null when the refusal is not a document service code. Such a refusal means the
// settings read earlier are out of date, so they are read again and the screen's gates follow.
export function useDocRefusal() {
  const { t } = useT();
  const qc = useQueryClient();
  return useCallback((e: unknown): string | null => {
    const code = refusalCode(e);
    if (!code) return null;
    void qc.invalidateQueries({ queryKey: dsetKeys.runtime }, { cancelRefetch: false });
    return t(`dset.code.${code}`);
  }, [t, qc]);
}
