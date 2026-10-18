import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useResync } from "@/shared/realtime";
import { useInsets } from "@/shared/lib/insets";
import { Counters } from "./Counters";
import { InfoCards } from "./InfoCards";
import { QuickActions } from "./QuickActions";
import { StatsStrip } from "./StatsStrip";
import { StatusBanner } from "./StatusBanner";
import { TasksBlock } from "./TasksBlock";
import { ToolsGrid } from "./ToolsGrid";
import { UpcomingBlock } from "./UpcomingBlock";
import type { DashModel } from "./useDashModel";

const KEYS = ["pro-workspace", "pro-requests", "pro-calendar", "pro-tasks", "pro-cases", "pro-clients"];

// Ish maydoni body: status banner, counters, quick actions, upcoming events, tasks, statistics, tools, plan.
export function Dashboard({ model, bottomPad, orgEntry }: { model: DashModel; bottomPad: number; orgEntry?: ReactNode }) {
  const qc = useQueryClient();
  const insets = useInsets();
  const refresh = () => KEYS.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
  useResync(refresh);
  const spin = model.cabinet.isRefetching;
  const limited = model.cabinet.data?.limited; // pending seller: only the verification state is available
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(bottomPad, insets.bottom + 24) }} refreshControl={<RefreshControl refreshing={spin} onRefresh={refresh} />} showsVerticalScrollIndicator={false}>
      <StatusBanner />
      {limited ? null : (
        <>
          <Counters model={model} />
          <QuickActions />
          <UpcomingBlock events={model.upcoming} />
          <TasksBlock tasks={model.openTasks} />
          <StatsStrip completed={model.doneCases} />
          <ToolsGrid />
        </>
      )}
      <InfoCards orgEntry={orgEntry} />
    </ScrollView>
  );
}
