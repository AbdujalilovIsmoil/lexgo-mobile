import { useRouter } from "expo-router";
import { ServiceBrowser, type ServicePick } from "@/widgets/service-browser";
import { OtherServices } from "./OtherServices";

// "Xizmat turlari": the marketplace's services by category, then the other services. A signed-in client orders the picked service at once
// (the order sheet: a specialist or the platform's own choice); a visitor sees the specialists who offer it.
export function ServiceTypes({ onOrder }: { onOrder: (service: ServicePick) => void }) {
  const router = useRouter();
  return (
    <ServiceBrowser
      footer={<OtherServices />}
      onPick={(service, authed) => (authed ? onOrder(service) : router.push({ pathname: "/lawyers", params: { service: service.id } } as never))}
    />
  );
}
