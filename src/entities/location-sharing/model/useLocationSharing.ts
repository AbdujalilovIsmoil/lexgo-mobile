import { useCallback, useEffect } from "react";
import { useT } from "@/shared/i18n";
import { useShareStore } from "./store";
import { startSharing, stopSharing, syncSharing } from "./runner";
import type { Fix, LocErrorKind } from "./types";

const ERR_KEY: Record<LocErrorKind, string> = {
  denied: "svcRules.locErrDenied",
  unavailable: "svcRules.locErrUnavailable",
  timeout: "svcRules.locErrTimeout",
  server: "svcRules.locErrServer",
  build: "svcRules.locErrBuild",
};

// Seller location sharing: state mirror (synced from GET on mount), start / stop (optionally with background updates), translated error.
export function useLocationSharing() {
  const { t } = useT();
  const state = useShareStore();
  useEffect(() => { void syncSharing(); }, []); // the server's state each time the card / sheet appears
  const start = useCallback((durationHours: number | null, fix: Fix, background = false) =>
    startSharing(durationHours, fix, background ? { notice: { title: t("svcRules.locBgNoticeTitle"), body: t("svcRules.locBgNoticeBody") } } : undefined), [t]);
  const stop = useCallback(() => stopSharing(), []);
  const errorText = state.error ? t(ERR_KEY[state.error.stop ? "server" : state.error.kind]) : "";
  return {
    state,
    on: state.mode === "on",
    busy: state.mode === "starting" || state.mode === "stopping",
    error: state.error,
    errorText,
    start,
    stop,
  };
}
