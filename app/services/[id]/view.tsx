import { useLocalSearchParams } from "expo-router";
import { ServiceViewPage } from "@/pages/service-view/ServiceViewPage";

// /services/<serviceId>/view - the blank sample of a document service, view only.
export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ServiceViewPage id={String(id)} />;
}
