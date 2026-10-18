import { useLocalSearchParams } from "expo-router";
import { ServiceDetailPage } from "@/pages/service-detail/ServiceDetailPage";

// /services/<id>[?package=&lawyer=&name=] - one service; a package or a directory advocate rides along to the order.
export default function Page() {
  const { id, package: pkg, lawyer, name } = useLocalSearchParams<{ id: string; package?: string; lawyer?: string; name?: string }>();
  return <ServiceDetailPage id={String(id)} packageId={pkg ? String(pkg) : undefined} lawyer={lawyer ? String(lawyer) : undefined} name={name ? String(name) : undefined} />;
}
