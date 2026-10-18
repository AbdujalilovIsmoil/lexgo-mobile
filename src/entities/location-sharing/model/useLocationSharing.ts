import { useCallback } from "react";
import { useT } from "@/shared/i18n";
import { useShareStore } from "./store";
import { startSharing, stopSharing } from "./runner";
import type { Fix, LocErrorKind } from "./types";

const ERR_KEY: Record<LocErrorKind, string> = {
  denied: "svcRules.locErrDenied",
  unavailable: "svcRules.locErrUnavailable",
  timeout: "svcRules.locErrTimeout",
  server: "svcRules.locErrServer",
  build: "svcRules.locErrBuild",
};

// Seller location sharing: state mirror (the server cannot be read back), start / stop, translated error.
export function useLocationSharing() {
  const { t } = useT();
  const state = useShareStore();
  const start = useCallback((durationHours: number | null, fix: Fix) => startSharing(durationHours, fix), []);
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
