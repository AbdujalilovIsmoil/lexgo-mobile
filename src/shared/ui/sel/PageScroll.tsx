import type { ReactNode, RefObject } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useInsets } from "@/shared/lib/insets";

type Props = { children: ReactNode; onRefresh?: () => void; refreshing?: boolean; gap?: number; scrollRef?: RefObject<ScrollView | null> };

// Scrolling body of a seller screen: side gutters, safe-area bottom gap, pull to refresh, taps work with the keyboard open.
export function PageScroll({ children, onRefresh, refreshing, gap = 14, scrollRef }: Props) {
  const insets = useInsets();
  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, paddingTop: 4, gap }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
