import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "@/shared/lib/storage";

export type ServicesTab = "services" | "packages";
const KEY = "pro.services.tab";

// Which tab of the seller's services screen is open; it is remembered, so a reload / restart returns to it.
export function useServicesTab(): [ServicesTab, (t: ServicesTab) => void] {
  const [tab, setTab] = useState<ServicesTab>("services");
  useEffect(() => {
    let live = true;
    void readJson<ServicesTab>(KEY).then((v) => live && (v === "packages" || v === "services") && setTab(v));
    return () => {
      live = false;
    };
  }, []);
  const change = useCallback((t: ServicesTab) => {
    setTab(t);
    void writeJson(KEY, t);
  }, []);
  return [tab, change];
}
