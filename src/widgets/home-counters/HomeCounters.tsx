import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useStatsRealtime } from "@/entities/client-stats";
import { useWorksRealtime } from "@/entities/work";
import { SectionHeader } from "@/shared/ui";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { CounterSheet, type ListKind } from "./CounterSheet";
import { useHomeCounters } from "./useHomeCounters";

// TZ 7: dashboard counters. Each tile is a real count; list counters open a drawer with their
// first rows (and a button to the full filtered list), the others go to their own screen.
export function HomeCounters() {
  const { t } = useT();
  const router = useRouter();
  const counters = useHomeCounters();
  const [open, setOpen] = useState<ListKind | null>(null);
  useStatsRealtime();
  useWorksRealtime();
  return (
    <View style={s.wrap}>
      <SectionHeader title={t("cl6.counters.title")} sub={t("cl6.counters.sub")} />
      <KpiGrid>
        {counters.map((c) => <KpiTile key={c.key} label={c.label} value={c.value} hint={c.hint} icon={c.icon} tint={c.tint} loading={c.loading} onPress={() => (c.kind ? setOpen(c.kind) : router.push((c.path ?? "/") as never))} />)}
      </KpiGrid>
      <CounterSheet kind={open} onClose={() => setOpen(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26 },
});
