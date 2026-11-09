import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { humanizeSlug, useAcademyCourses } from "@/entities/academy";
import { AcademyFilters, CourseCard } from "@/widgets/academy";
import { EmptyState, ErrorView, Screen, SecondaryHeader, SkeletonCard } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { HOME_BG } from "@/widgets/client-dash";

const SEARCH_FROM = 7;

// Client academy (web /portal/client/academy): hero, category + search filters, course cards.
export function AcademyPage() {
  const { colors: c, dark } = useTheme();
  const ground = dark ? c.canvas : HOME_BG;
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
    <View style={[s.fill, { backgroundColor: ground }]}>
      <SecondaryHeader title={t("cpd.menu.academy")} description={t("cpd.academy.subtitle")} />
      <Screen topInset={false} ground={ground} refreshing={isRefetching} onRefresh={() => void refetch()} contentContainerStyle={s.content}>
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

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 16 } });
