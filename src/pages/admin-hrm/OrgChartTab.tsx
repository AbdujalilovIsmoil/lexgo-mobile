import { useBoard, type OrgNode } from "@/entities/admin-hrm";
import { OrgChart } from "@/widgets/admin-hrm";
import { QueryBoundary } from "@/shared/ui/admin";

// The org tree as a zoomable / pannable chart; a tap on a unit opens its detail sheet (handled by the page).
export function OrgChartTab({ onUnit }: { onUnit: (n: OrgNode) => void }) {
  const q = useBoard();
  return <QueryBoundary query={q}>{q.data ? <OrgChart nodes={q.data.nodes} onSelect={onUnit} /> : <></>}</QueryBoundary>;
}
