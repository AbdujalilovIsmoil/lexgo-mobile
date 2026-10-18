import { useLocalSearchParams } from "expo-router";
import { useAccess } from "@/entities/access";
import { DetailScreen, ProDetail } from "@/widgets/urgent";

// /urgent/[id], /pro/urgent/[id] (?pool=1 for a pool item) and /cc/urgent/[id] share one detail screen.
// /urgent/[id] is where a notification lands: an advocate gets the advocate view, everybody else the client one.
export function ClientDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { seller } = useAccess();
  return <DetailScreen id={String(id)} scope={seller ? "pro" : "client"} />;
}
export const ProDetailPage = () => {
  const { id, pool } = useLocalSearchParams<{ id: string; pool?: string }>();
  return <ProDetail id={String(id)} pool={!!pool} />;
};
export const CcDetailPage = () => <DetailScreen id={String(useLocalSearchParams<{ id: string }>().id)} scope="cc" />;
