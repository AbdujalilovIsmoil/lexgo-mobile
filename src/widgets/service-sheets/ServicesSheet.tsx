import { useState, type ReactNode } from "react";
import { ServiceList, type Service } from "@/entities/service";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { ServiceDetail } from "./ServiceDetail";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  services?: Service[];
  loading?: boolean;
  before?: ReactNode;
  after?: ReactNode;
};

// One drawer, two views: a service list (with optional extra blocks) and the
// detail of the tapped service. "Back" returns to the list without closing.
export function ServicesSheet({ visible, onClose, title, subtitle, services, loading, before, after }: Props) {
  const [picked, setPicked] = useState<Service | null>(null);
  const navigate = useSheetNavigate(onClose);
  const close = () => {
    setPicked(null);
    onClose();
  };
  return (
    <BottomSheet visible={visible} onClose={close} title={picked ? undefined : title} subtitle={subtitle}>
      <SheetScroll>
        {picked ? (
          <ServiceDetail service={picked} onBack={() => setPicked(null)} navigate={navigate} />
        ) : (
          <>
            {before}
            <ServiceList services={services} loading={loading} onPick={setPicked} />
            {after}
          </>
        )}
      </SheetScroll>
    </BottomSheet>
  );
}
