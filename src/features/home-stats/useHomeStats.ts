import { useLawyerPage } from "@/entities/lawyer";
import { useServiceCategories } from "@/entities/service";

// Live numbers for the Home tiles and hero tags (all from the backend).
export function useHomeStats() {
  const lawyers = useLawyerPage();
  const cats = useServiceCategories();
  const items = lawyers.data?.items ?? [];
  return {
    lawyers: lawyers.data?.total ?? 0,
    services: cats.data?.reduce((n, c) => n + c.servicesCount, 0) ?? 0,
    regions: new Set(items.map((l) => l.region).filter(Boolean)).size,
  };
}
