import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useInsets } from "@/shared/lib/insets";

// Scrolling page of the owner area with pull-to-refresh.
export function OrgScroll({ refreshing, onRefresh, children }: { refreshing: boolean; onRefresh: () => void; children: ReactNode }) {
  const insets = useInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, gap: 14 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {children}
    </ScrollView>
  );
}
