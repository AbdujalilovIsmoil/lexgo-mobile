import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { LeadsHeader } from "../LeadsHeader";
import { BoardColumn } from "../BoardColumn";
import { useInsets } from "@/shared/lib/insets";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ScrollTop } from "./ScrollTop";
import type { LeadsPage } from "./useLeadsPage";

// Kanban view: the header on top, then every status as a column you swipe through (one column ≈ one screen).
export function LeadsBoard({ p, bottomPad, scrollActions }: { p: LeadsPage; bottomPad?: number; scrollActions?: ReactNode }) {
  const { t } = useT();
  const insets = useInsets();
  const { width } = useWindowDimensions();
  const colW = Math.round(width * 0.86);
  const cols = p.view.shown;
  return (
    <ScrollView refreshControl={<RefreshControl refreshing={p.query.isRefetching} onRefresh={() => void p.query.refetch()} />} contentContainerStyle={{ paddingBottom: bottomPad ?? insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      {scrollActions ? <ScrollTop actions={scrollActions} /> : null}
      <View style={s.pad}>
        <LeadsHeader stats={p.stats} filter={p.filter} onFilter={p.setFilter} stage={p.stage} onStage={p.setStage} options={p.stageOptions} filtered={p.view.filtered} matched={p.view.matched} mode={p.mode} onMode={p.setMode} />
      </View>
      {cols.length ? (
        <ScrollView horizontal snapToInterval={colW + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
          {cols.map((col, i) => (
            <BoardColumn key={col.key} col={col} at={i} last={cols.length - 1} width={colW} filtered={p.view.filtered} ops={p.ops} meId={p.meId} busyId={p.flow.busyId ?? ""} onOpen={(l) => p.setSelId(l.id)} onShift={(l, d) => p.flow.shift(l, d)} onStage={(l) => p.setMoveFor(l)} />
          ))}
        </ScrollView>
      ) : <EmptyState icon="trending-up" title={t("admLeads.empty")} text={t("admLeads.emptyText")} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({ pad: { paddingHorizontal: 16 }, row: { paddingHorizontal: 16, gap: 12, alignItems: "flex-start" } });
