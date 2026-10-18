import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { moduleByKey, useAccess } from "@/entities/access";
import { Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import type { DashCtx } from "../lib/useDashCtx";
import { attentionDrills } from "./drills";
import { useAttention } from "./useAttention";

type Icon = "clock" | "user-plus" | "credit-card" | "alert-circle" | "shield";

// "Kutilayotgan ishlar": one row per queue with the count on the right; a tap opens a drawer with everything behind it.
export function DashAttention({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, q } = x;
  const a = useAttention();
  const access = useAccess();
  const dr = attentionDrills(x, a);
  const tp = (k: string) => t(`admDashC.attn.${k}`);
  const rows: { icon: Icon; tint: string; mod: string; make: () => Drill; sub: string; value: string }[] = [
    { icon: "clock", tint: "#F59E0B", mod: "payouts", make: dr.pay, sub: fmt.short(x.stat("pending_amount")), value: fmt.int(x.stat("pending_count")) },
    { icon: "user-plus", tint: "#22C55E", mod: "registerRequests", make: dr.sellers, sub: tp("waiting"), value: fmt.int(a.sellers?.stats.pending) },
    { icon: "credit-card", tint: "#3B82F6", mod: "payouts", make: dr.payouts, sub: fmt.short(a.payouts?.amount), value: fmt.int(a.payouts?.count) },
    { icon: "alert-circle", tint: "#EF4444", mod: "adminTasks", make: dr.tasks, sub: a.tasks ? t("admDashC.attn.ofOpen", { n: a.tasks.open }) : "", value: fmt.int(a.tasks?.overdue) },
    { icon: "shield", tint: "#8B5CF6", mod: "complaints", make: dr.complaints, sub: t("admDashC.attn.flagged", { n: fmt.int(q?.flagged.length ?? 0), p: fmt.pct(q?.resolvedPct) }), value: fmt.pct(q?.complaintRate) },
  ];
  const open = (r: (typeof rows)[number]) => () => {
    const d = r.make();
    onOpen({ ...d, link: moduleByKey(r.mod)?.visible(access) ? { module: r.mod, label: t(`admHub.mod.${r.mod}.title`) } : undefined });
  };
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{tp("title")}</Text>
      {rows.map((r) => {
        const d = r.make();
        return <RowCard key={d.title} icon={r.icon} tint={r.tint} title={d.title} subtitle={r.sub} onPress={open(r)} right={<Text variant="h3" style={{ color: r.tint }}>{r.value}</Text>} />;
      })}
    </View>
  );
}
