import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { QueryBoundary } from "@/shared/ui/admin";
import { DashFilters } from "./DashFilters";
import { DemoBanner } from "./DemoBanner";
import type { DashFilterState } from "./useDashFilter";

type DashViewState = { demo: boolean; isLoading: boolean; isError: boolean; error: unknown; isRefetching: boolean; refetch: () => unknown };

// Body of every dashboard screen: pull-to-refresh, the filter header, the demo banner and
// skeleton → error (or `errorSlot`) → content.
export function DashFrame({ f, view, errorSlot, inline, tabPad, sheetFilters, children }: { f: DashFilterState; view: DashViewState; errorSlot?: ReactNode; inline?: boolean; tabPad?: boolean; sheetFilters?: boolean; children: ReactNode }) {
  const insets = useInsets();
  const retry = () => void view.refetch();
  const body = (
    <>
      <DashFilters f={f} sheet={sheetFilters} />
      <DemoBanner demo={view.demo && !view.isLoading} />
      {view.isError && errorSlot ? errorSlot : (
        <QueryBoundary query={view}>
          <View style={{ gap: 14, paddingHorizontal: 16 }}>{children}</View>
        </QueryBoundary>
      )}
    </>
  );
  // `inline`: embedded in another scroll view (staff Home), so no own scroller / refresh.
  if (inline) return <View style={{ gap: 14, marginTop: 20 }}>{body}</View>;
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={view.isRefetching} onRefresh={retry} />} contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + (tabPad ? 130 : 24) }}>
      {body}
    </ScrollView>
  );
}
