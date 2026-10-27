import { useRouter } from "expo-router";
import { ModeNotice, type ModeGate } from "@/entities/doc-settings";
import { AdminPage } from "@/shared/ui/admin";

// The document service mode of this flow is switched off by the platform, or this account's plan does not include it (TZ.md §4).
export function FlowGate({ title, gate }: { title: string; gate: ModeGate }) {
  const router = useRouter();
  return (
    <AdminPage title={title}>
      <ModeNotice gate={gate} onPlan={() => router.push("/subscription")} onBack={() => router.back()} />
    </AdminPage>
  );
}
