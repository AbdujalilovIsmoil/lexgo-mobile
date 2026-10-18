import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { secKeys } from "@/entities/security";
import { identifyDevice } from "../lib/identifyDevice";

// Once per signed-in device: find out which row of the sessions list is this one, then refresh the list
// so "this device" shows (and revoking it signs this app out).
export function useIdentifyDevice(known: boolean): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (known) return;
    void identifyDevice().then((ok) => {
      if (ok) void qc.invalidateQueries({ queryKey: secKeys.sessions });
    });
  }, [known, qc]);
}
