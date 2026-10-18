import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { systemKeys } from "@/entities/admin-system";
import { useInsets } from "@/shared/lib/insets";

// A scrolling tab body whose pull-to-refresh refetches the system-status queries.
export function TabScroll({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const insets = useInsets();
  const busy = useIsFetching({ queryKey: systemKeys.all }) > 0;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: insets.bottom + 24 }} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void qc.invalidateQueries({ queryKey: systemKeys.all })} />} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
