import { useLocalSearchParams } from "expo-router";
import { useAccess } from "@/entities/access";
import { DetailScreen, ProDetail } from "@/widgets/urgent";

// /urgent/[id] and /pro/urgent/[id] share one detail screen.
// /urgent/[id] is where a notification lands: an advocate gets the advocate view, everybody else the client one.
export function ClientDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { seller } = useAccess();
  return <DetailScreen id={String(id)} scope={seller ? "pro" : "client"} />;
}
export const ProDetailPage = () => <ProDetail id={String(useLocalSearchParams<{ id: string }>().id)} />;
