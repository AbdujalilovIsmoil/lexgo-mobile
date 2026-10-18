import { View } from "react-native";
import { Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";

// Placeholder frame while the schema / drafts load.
export function FlowLoading({ title }: { title: string }) {
  return (
    <AdminPage title={title}>
      <View style={{ padding: 16, gap: 14 }}>
        <Skeleton height={36} round={18} />
        <Skeleton height={56} round={14} />
        <Skeleton height={56} round={14} />
        <Skeleton height={120} round={14} />
      </View>
    </AdminPage>
  );
}
