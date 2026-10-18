import { useMemo } from "react";
import { useServices } from "@/entities/admin-services";
import { useT } from "@/shared/i18n";

// The service catalogue (active + inactive) as id → title / price, for naming package components and picking new ones.
export function useServiceNames() {
  const { locale } = useT();
  const q = useServices("", undefined, locale);
  const byId = useMemo(() => new Map((q.data ?? []).map((s) => [s.id, s] as const)), [q.data]);
  return { all: q.data ?? [], byId, loading: q.isLoading };
}
