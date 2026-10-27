import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAchievementsLive, useMyAchievements, type AchRecord } from "@/entities/pro-achievements";
import { useExpCategories } from "@/entities/pro-experience";
import { AchievementSheet } from "@/features/pro-achievement-form";
import { Button, EmptyState, Skeleton, Text } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { ShowMore } from "@/shared/ui/profile";
import { PageScroll } from "@/shared/ui/sel";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { useT } from "@/shared/i18n";
import { AchievementCard } from "./AchievementCard";

// The skeleton keeps the page's own layout while the first ten load.
function Placeholders() {
  return <View style={s.col}>{[0, 1, 2].map((i) => <Skeleton key={i} height={132} round={20} />)}</View>;
}

// Contract §17 "Seller achievements" for a yurist / advokat, ten at a time: each with its state (under review, approved, rejected with the
// reason) and its files. Only adding: every submission goes to the call center, and nothing counts for the rating until it approves.
// The call center's decision refreshes the list while the screen is open.
export function AchievementsPage() {
  const { t } = useT();
  const q = useMyAchievements();
  const cats = useExpCategories();
  const pull = usePullRefresh(() => q.refetch());
  useAchievementsLive();
  const [open, setOpen] = useState(false);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[q.data.pages.length - 1]?.total ?? items.length;
  const category = (a: AchRecord) => a.categoryName || cats.data?.find((x) => x.id === a.categoryId)?.title || "";
  const add = <Button title={t("ach.add")} icon="plus" variant="gradient" onPress={() => setOpen(true)} style={s.center} />;
  return (
    <AdminPage title={t("ach.title")} subtitle={t("ach.menu")}>
      <QueryBoundary query={q} skeleton={<Placeholders />}>
        <PageScroll onRefresh={pull.onRefresh} refreshing={pull.refreshing}>
          <Text variant="small" tone="gray">{t("ach.lead")}</Text>
          {items.length ? (
            <>
              {add}
              {items.map((a) => <AchievementCard key={a.id} a={a} category={category(a)} />)}
              <ShowMore left={q.hasNextPage ? Math.max(1, total - items.length) : 0} expanded={false} onMore={() => void q.fetchNextPage()} onLess={() => undefined} />
            </>
          ) : (
            <>
              <EmptyState icon="award" title={t("ach.empty")} compact />
              {add}
            </>
          )}
        </PageScroll>
      </QueryBoundary>
      <AchievementSheet visible={open} onClose={() => setOpen(false)} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ center: { alignSelf: "center" }, col: { gap: 12, padding: 16 } });
