import type { Service } from "@/entities/service";
import { OrderSheet } from "@/features/order-service";
import { useTemplateDownload } from "@/features/service-open";
import { TemplateGates } from "@/widgets/ai-plan-upgrade";
import { NewDocSheet } from "@/widgets/services-catalog";

type Dl = ReturnType<typeof useTemplateDownload>;
type Props = { order: Service | null; onOrder: (s: Service | null) => void; newDoc: boolean; onNewDoc: (v: boolean) => void; dl: Dl; pre?: { id: string; name: string }; packageId?: string };

// The three sheets every catalogue page can raise: the new-document order, the service order (advocate, price, payment)
// and the template-download plan gates. Shared by the catalogue tab and the page of one direction.
export function CatalogSheets({ order, onOrder, newDoc, onNewDoc, dl, pre, packageId }: Props) {
  return (
    <>
      <NewDocSheet visible={newDoc} onClose={() => onNewDoc(false)} />
      <OrderSheet service={order} preSeller={pre} packageId={packageId} onClose={() => onOrder(null)} />
      <TemplateGates gates={dl} />
    </>
  );
}
