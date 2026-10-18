import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { REGION_KEYS, type LawyerFilters } from "@/entities/lawyer";
import { useLawyerFilterStore } from "@/features/lawyer-filter";

type Params = { q?: string; area?: string; region?: string; service?: string; ai?: string };

// Deep links into the directory: /marketplace?q=…&area=…&region=…&service=…&ai=…
// (notifications, Home chips, other roles). Applied once per link.
export function useMarketParams(setText: (t: string) => void, setAiText: (t: string) => void): void {
  const p = useLocalSearchParams<Params>();
  const key = JSON.stringify(p);
  useEffect(() => {
    const store = useLawyerFilterStore.getState();
    const patch: Partial<LawyerFilters> = {};
    if (p.area) patch.area = p.area;
    if (p.service) patch.service = p.service;
    if (p.region && (REGION_KEYS as readonly string[]).includes(p.region)) patch.region = p.region;
    if (p.q && !p.ai) patch.q = p.q;
    if (Object.keys(patch).length) store.set(patch);
    if (p.q && !p.ai) setText(p.q);
    if (p.ai && p.q) {
      setAiText(p.q);
      store.runAi(p.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
