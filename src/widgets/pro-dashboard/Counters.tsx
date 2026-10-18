import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import type { DashModel } from "./useDashModel";

type Def = { key: string; icon: "file-text" | "zap" | "shopping-bag" | "video" | "check-square" | "message-circle" | "briefcase" | "users"; tint: string; route: string; value: (m: DashModel) => number };
const TILES: Def[] = [
  { key: "docs", icon: "file-text", tint: "#3B82F6", route: "/pro/docs", value: (m) => m.counts.docs },
  { key: "urgent", icon: "zap", tint: "#F59E0B", route: "/pro/urgent", value: (m) => m.counts.urgent },
  { key: "orders", icon: "shopping-bag", tint: "#8B5CF6", route: "/pro/orders", value: (m) => m.counts.orders },
  { key: "meetings", icon: "video", tint: "#EC4899", route: "/pro/calendar", value: (m) => m.meetingsToday },
  { key: "tasks", icon: "check-square", tint: "#14B8A6", route: "/pro/tasks", value: (m) => m.openTasks.length },
  { key: "unread", icon: "message-circle", tint: "#EF4444", route: "/(tabs)/messages", value: (m) => m.unread },
  { key: "cases", icon: "briefcase", tint: "#22C55E", route: "/pro/cases", value: (m) => m.activeCases },
  { key: "clients", icon: "users", tint: "#64748B", route: "/(tabs)/clients", value: (m) => m.clients },
];

// Real counters from the endpoints; each tile opens its module.
export function Counters({ model }: { model: DashModel }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <KpiGrid>
      {TILES.map((d) => <KpiTile key={d.key} icon={d.icon} tint={d.tint} label={t(`aw1.c.${d.key}`)} value={String(d.value(model))} onPress={() => router.push(d.route as never)} />)}
    </KpiGrid>
  );
}
