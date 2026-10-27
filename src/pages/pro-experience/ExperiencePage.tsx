import { useState } from "react";
import { StyleSheet } from "react-native";
import { useExpCategories, useExperienceLive, useMyExperience, type ExpGroup, type ExpRecord } from "@/entities/pro-experience";
import { ExperienceSheet } from "@/features/pro-experience-form";
import { Button, EmptyState, Text } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { PageScroll } from "@/shared/ui/sel";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { useT } from "@/shared/i18n";
import { EntryCard } from "./EntryCard";
import { HistorySheet } from "./HistorySheet";

// TZ.md Gaps Closed §3 "Experience by category" for a yurist / advokat, ten entries at a time: each with its verified data and the state
// of its newer revision (under review, rejected with the reason, withdrawn), its files and its review history. Add, edit (a new revision),
// fix a rejected edit or withdraw one under review; nothing here changes the price or the ranking until the call center approves it.
// The call center's decision refreshes the list while the screen is open.
export function ExperiencePage() {
  const { t } = useT();
  const q = useMyExperience();
  const cats = useExpCategories();
  const pull = usePullRefresh(() => q.refetch());
  useExperienceLive();
  const [sheet, setSheet] = useState<{ group: ExpGroup | null; base: ExpRecord | null } | null>(null);
  const [hist, setHist] = useState<{ group: ExpGroup; open: boolean } | null>(null);
  const groups = q.data ?? [];
  const page = useShowMore(groups);
  const category = (r: ExpRecord) => {
    const cat = cats.data?.find((x) => x.id === r.categoryId);
    return [cat?.title, cat?.children.find((x) => x.id === r.subcategoryId)?.title].filter(Boolean).join(" · ");
  };
  // Above the list; with nothing added yet, under the "no experience yet" note.
  const add = <Button title={t("mf.exp.add")} icon="plus" variant="gradient" onPress={() => setSheet({ group: null, base: null })} style={s.center} />;
  return (
    <AdminPage title={t("mf.exp.title")} subtitle={t("mf.exp.menu")}>
      <QueryBoundary query={q}>
        <PageScroll onRefresh={pull.onRefresh} refreshing={pull.refreshing}>
          <Text variant="small" tone="gray">{t("mf.exp.lead")}</Text>
          {groups.length ? (
            <>
              {add}
              {page.visible.map((g) => <EntryCard key={g.rootId} g={g} category={category} onEdit={(base) => setSheet({ group: g, base })} onHistory={() => setHist({ group: g, open: true })} />)}
              <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
            </>
          ) : (
            <>
              <EmptyState icon="briefcase" title={t("mf.exp.empty")} compact />
              {add}
            </>
          )}
        </PageScroll>
      </QueryBoundary>
      <ExperienceSheet visible={!!sheet} onClose={() => setSheet(null)} group={sheet?.group ?? null} base={sheet?.base ?? null} />
      <HistorySheet group={hist?.group ?? null} visible={!!hist?.open} onClose={() => setHist((h) => (h ? { ...h, open: false } : h))} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ center: { alignSelf: "center" } });
