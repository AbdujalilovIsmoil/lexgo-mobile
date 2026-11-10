import type { ReactNode } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { HOME_BG } from "@/widgets/client-dash";
import { useTabClearance, useTabHeader } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { radius, useTheme } from "@/shared/theme";
import { EmptyState, ErrorView, Icon, PressableScale, singleLineText, Skeleton } from "@/shared/ui";
import { CategoryTabs } from "./CategoryTabs";
import type { BrowseCard } from "./model/cards";
import { HUES, ServiceCard } from "./ServiceCard";
import { useServiceBrowser } from "./useServiceBrowser";

const TABS = { kind: "tabs" } as const;
const SEARCH = { kind: "search" } as const;
type Item = typeof TABS | typeof SEARCH | BrowseCard;
export type ServicePick = { id: string; name: string; price?: number };

type Props = { footer?: ReactNode; onPick: (service: ServicePick, authed: boolean) => void };

// Every service of the marketplace: the category tabs pinned 2 pt under the header, the search that scrolls away, then the rows, `footer` under them. A tap on a service
// belongs to the page (`onPick`); a service this client already bought opens that order instead.
export function ServiceBrowser({ footer, onPick }: Props) {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const header = useTabHeader(16);
  const clearance = useTabClearance();
  const b = useServiceBrowser();
  const pull = usePullRefresh(b.refetch);
  const hueOf = (id: string) => HUES[Math.max(0, b.hueIds.indexOf(id)) % HUES.length];
  const filtered = !!b.q.trim() || !!b.cat;
  const state = b.loading ? (
    <View style={s.gap}>{[0, 1, 2].map((i) => <Skeleton key={i} height={96} round={20} />)}</View>
  ) : b.error ? (
    <ErrorView error={b.error} onRetry={() => void b.refetch()} />
  ) : !b.shown.length ? (
    <EmptyState icon={filtered ? "search" : "briefcase"} title={t(filtered ? "tabs.svb.noMatch" : "tabs.svb.empty")} />
  ) : null;
  const tabs = b.chips.length > 1 ? (
    <View style={[s.tabs, { backgroundColor: dark ? c.canvas : HOME_BG }]}>
      <CategoryTabs
        value={b.cat}
        onChange={(id) => b.setCat(b.cat === id ? "" : id)}
        tabs={[{ id: "", label: t("tabs.svb.all") }, ...b.chips.map((id) => ({ id, label: b.labels.get(id) ?? "", dot: hueOf(id).fg }))]}
      />
    </View>
  ) : null;
  const search = (
    <View style={s.search}>
      <View style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
        <Icon name="search" size={20} tone="gray" />
        <TextInput
          value={b.q}
          onChangeText={b.setQ}
          placeholder={t("tabs.svb.search")}
          placeholderTextColor={c.gray2}
          accessibilityLabel={t("tabs.svb.search")}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={c.accent}
          style={[s.input, singleLineText, { color: c.ink }]}
        />
        {b.q ? (
          <PressableScale onPress={() => b.setQ("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("tabs.svb.clear")}><Icon name="x" size={16} tone="gray" /></PressableScale>
        ) : null}
      </View>
    </View>
  );
  return (
    <FlatList<Item>
      data={[TABS, SEARCH, ...(b.loading || b.error ? [] : b.shown)]}
      keyExtractor={(x) => ("kind" in x ? x.kind : x.id)}
      stickyHeaderIndices={[1]}
      ListHeaderComponent={<>{header}</>}
      ListFooterComponent={<>{state}{footer}</>}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: clearance }}
      refreshing={pull.refreshing}
      onRefresh={pull.onRefresh}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        if ("kind" in item) return item === TABS ? tabs : search;
        const order = b.bought.get(item.id);
        return (
          <View style={s.row}>
            <ServiceCard
              card={item}
              category={b.labels.get(item.categoryId) ?? ""}
              slugs={b.slugs.get(item.categoryId) ?? []}
              hue={hueOf(item.categoryId)}
              bought={!!order}
              onPress={() => (order ? router.push({ pathname: "/orders/[id]", params: { id: order } }) : onPick({ id: item.id, name: item.title, price: item.basePrice || undefined }, b.authed))}
            />
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  tabs: { paddingTop: 2, paddingBottom: 8, marginHorizontal: -16, paddingHorizontal: 16 },
  search: { paddingTop: 2, paddingBottom: 12 },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1 },
  input: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 10 },
  row: { paddingBottom: 12 },
  gap: { gap: 12 },
});
