import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { humanizeSlug, useAcademyCourses } from "@/entities/academy";
import { AcademyFilters, CourseCard } from "@/widgets/academy";
import { EmptyState, ErrorView, Header, Screen, SkeletonCard, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const SEARCH_FROM = 7;

// Client academy (web /portal/client/academy): hero, category + search filters, course cards.
export function AcademyPage() {
  const c = useColors();
  const { t } = useT();
  const { data = [], isLoading, error, refetch, isRefetching } = useAcademyCourses();
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const catLabel = (k: string) => { const l = t(`cpd.academy.categories.${k}`); return l.startsWith("cpd.") ? humanizeSlug(k) : l; };
  const cats = useMemo(() => [...new Set(data.map((x) => x.category).filter(Boolean))], [data]);
  const searchable = data.length >= SEARCH_FROM;
  const needle = searchable ? q.trim().toLowerCase() : "";
  const found = data.filter((x) => !needle || `${x.title} ${x.category ? catLabel(x.category) : ""}`.toLowerCase().includes(needle));
  const list = found.filter((x) => !cat || x.category === cat);
  const opts = [{ value: "", label: `${t("cpd.academy.all")} (${found.length})` }, ...cats.map((k) => ({ value: k, label: `${catLabel(k)} (${found.filter((x) => x.category === k).length})` }))];
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("cpd.menu.academy")} />
      <Screen topInset={false} refreshing={isRefetching} onRefresh={() => void refetch()} contentContainerStyle={s.content}>
        <Text variant="h2">{t("cpd.academy.title")}</Text>
        <Text variant="small" tone="gray">{t("cpd.academy.subtitle")}</Text>
        {!isLoading && (cats.length > 1 || searchable) ? <AcademyFilters cats={opts} cat={cat} onCat={setCat} q={q} onQ={setQ} searchable={searchable} /> : null}
        {error ? <ErrorView error={error} onRetry={() => void refetch()} /> : isLoading ? [0, 1, 2].map((i) => <SkeletonCard key={i} />) : !list.length && data.length ? (
          <EmptyState icon="search" title={t("cpd.academy.noMatch")} text={t("cpd.academy.noMatchText")} />
        ) : !list.length ? <EmptyState icon="book-open" title={t("cpd.academy.empty")} text={t("cpd.academy.emptyText")} /> : (
          list.map((x) => <CourseCard key={x.id} course={x} category={x.category ? catLabel(x.category) : ""} />)
        )}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 6 } });
