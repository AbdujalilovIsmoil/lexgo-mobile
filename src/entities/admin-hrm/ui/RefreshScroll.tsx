import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useInsets } from "@/shared/lib/insets";

// Plain scrolling page with pull-to-refresh (dashboards, profile) — the non-list counterpart of PagedList.
export function RefreshScroll({ refreshing, onRefresh, children }: { refreshing: boolean; onRefresh: () => void; children: ReactNode }) {
  const insets = useInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {children}
    </ScrollView>
  );
}
