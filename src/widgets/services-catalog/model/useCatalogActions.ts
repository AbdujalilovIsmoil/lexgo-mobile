import type { Service } from "@/entities/service";
import { useServiceOpen } from "@/features/service-open";
import type { TileActions } from "../ui/ServiceTile";

export type Dl = { locked: boolean; note: string; busy: string; error: { id: string; msg: string } | null; download: (s: { id: string; name: string }) => void | Promise<void> };

// What each of a card's four buttons does. A document service sends to the duty advocate
// (/services/{id}/lawyer); one without a template opens the order sheet to pick an advocate.
export function useCatalogActions(dl: Dl, onOrder: (s: Service) => void) {
  const open = useServiceOpen();
  return (s: Service): TileActions => ({
    onView: () => open.view(s.id),
    onDownload: () => open.guard(() => void dl.download(s)),
    onLawyer: () => (s.documentTemplateId ? open.lawyer(s.id) : open.guard(() => onOrder(s))),
    onFill: () => open.fill(s.id),
  });
}
