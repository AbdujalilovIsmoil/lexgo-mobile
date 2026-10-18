import { useLocalSearchParams } from "expo-router";
import { OrderScreen } from "@/widgets/urgent";

// /urgent/new?service=<key> — the order form.
export default function UrgentNewPage() {
  const { service, from } = useLocalSearchParams<{ service?: string; from?: string }>();
  return <OrderScreen service={String(service ?? "")} fromUrgent={from === "urgent"} />;
}
