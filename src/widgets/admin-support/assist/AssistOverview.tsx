import { useMemo, useState } from "react";
import { View } from "react-native";
import type { AssistContext, AssistPlan } from "@/entities/admin-support";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOverviewRows } from "./OverviewRows";

type Kind = "subs" | "pending" | "docs" | "orders";
const KINDS: Kind[] = ["subs", "pending", "docs", "orders"];
const PREVIEW = 3;

// The client's state: active subscriptions, requests awaiting payment, recent documents and orders.
export function AssistOverview({ ctx, plans }: { ctx: AssistContext; plans: AssistPlan[] }) {
  const { t } = useT();
  const [open, setOpen] = useState<Kind | null | undefined>(undefined);
  const [full, setFull] = useState(false);
  const names = useMemo(() => Object.fromEntries(plans.flatMap((p) => [[p.id, p.name], [p.slug, p.name]])), [plans]);
  const rows = useOverviewRows(names);
  const lists: Record<Kind, unknown[]> = { subs: ctx.subs, pending: ctx.pending, docs: ctx.docs, orders: ctx.orders };
  const shown = open === undefined ? (ctx.pending.length ? "pending" : ctx.subs.length ? "subs" : null) : open;
  const cut = <T,>(l: T[]) => (full ? l : l.slice(0, PREVIEW));
  const body =
    shown === "subs" ? cut(ctx.subs).map(rows.sub) : shown === "pending" ? cut(ctx.pending).map(rows.pending) : shown === "docs" ? cut(ctx.docs).map(rows.doc) : shown === "orders" ? cut(ctx.orders).map(rows.order) : null;
  const total = shown ? lists[shown].length : 0;
  return (
    <SectionCard title={t("admSupB.overview.heading")}>
      <KpiGrid>
        {KINDS.map((k) => (
          <KpiTile key={k} label={t(`admSupB.overview.${k}`)} value={String(lists[k].length)} tint={k === "pending" && ctx.pending.length ? "#F59E0B" : undefined} onPress={() => { setOpen(shown === k ? null : k); setFull(false); }} />
        ))}
      </KpiGrid>
      {shown ? (
        <View style={{ gap: 8 }}>
          {body}
          {total === 0 ? <Text variant="small" tone="gray">{t(`admSupB.overview.${shown}Empty`)}</Text> : null}
          {total > PREVIEW ? <PressableScale onPress={() => setFull((v) => !v)}><Text variant="small" tone="accent" weight="bold" center>{full ? t("admSupB.showLess") : t("admSupB.showAll", { n: total })}</Text></PressableScale> : null}
        </View>
      ) : null}
    </SectionCard>
  );
}
