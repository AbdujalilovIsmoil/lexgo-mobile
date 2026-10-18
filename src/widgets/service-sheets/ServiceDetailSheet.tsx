import type { Service } from "@/entities/service";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useKept } from "@/shared/lib/useKept";
import { ServiceDetail } from "./ServiceDetail";

// A drawer for a single service (used by the in-place lists of the Services tab).
export function ServiceDetailSheet({ service: current, onClose }: { service: Service | null; onClose: () => void }) {
  const service = useKept(current);
  const navigate = useSheetNavigate(onClose);
  return (
    <BottomSheet visible={!!current} onClose={onClose} snaps={[0.7, 0.93]}>
      <SheetScroll>{service ? <ServiceDetail service={service} navigate={navigate} /> : null}</SheetScroll>
    </BottomSheet>
  );
}
