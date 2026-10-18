import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useInsets } from "@/shared/lib/insets";

type Props = { children: ReactNode; onRefresh?: () => void; refreshing?: boolean; gap?: number };

// Scrolling body of a seller screen: side gutters, safe-area bottom gap, pull to refresh, taps work with the keyboard open.
export function PageScroll({ children, onRefresh, refreshing, gap = 14 }: Props) {
  const insets = useInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, paddingTop: 4, gap }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
