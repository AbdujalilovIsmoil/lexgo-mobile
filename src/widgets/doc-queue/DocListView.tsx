import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, EmptyState, ErrorView } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { DocRow, DocRowSkeleton, docCan, flowCounts, docPath, editorPath, tabCounts, useDocSync, useDocs, useLocalPaged, type DocReq, type DocTab } from "@/entities/doc-queue";
import { TransferSheet, useClaim } from "@/features/doc-pool";
import { DocListFooter } from "./DocListFooter";
import { DocListHead } from "./DocListHead";
import { DocSheet } from "./DocSheet";
import { useDocFilter } from "./useDocFilter";

// A sheet must be gone before the next one (transfer) or another screen opens over it.
const HAND_OFF = 320;

// "My document requests": status tabs (each a server-side filter), search, work type, sort, realtime refresh. Ten cards at a
// time; a tap opens the detail sheet, the full page /pro/docs/[id] is one tap further.
export function DocListView() {
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const me = useSession()?.user.id ?? "";
  const [tab, setTab] = useState<DocTab>("claimed");
  const [open, setOpen] = useState("");
  const [move, setMove] = useState<DocReq | null>(null);
  const shown = useKept(open || null) ?? "";
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const f = useDocFilter();
  const q = useDocs(tab);
  const all = useDocs("all");
  const claim = useClaim((id) => router.replace(editorPath(id)));
  useDocSync();
  useEffect(() => () => clearTimeout(timer.current), []);
  const items = f.apply(q.data ?? []);
  const { shown: rows, query, page } = useLocalPaged(q, items, `${tab}|${f.key}`);
  const counts = tabCounts(all.data ?? []);
  const filtered = !!q.data?.length && !items.length;
  const later = (fn: () => void) => { setOpen(""); clearTimeout(timer.current); timer.current = setTimeout(fn, HAND_OFF); };

  const quick = (d: DocReq) => {
    const can = docCan(d, me);
    return can.claim ? <Button title={t("proDocSheet.act.claim")} icon="check-circle" size="sm" loading={claim.isPending && claim.variables === d.id} onPress={() => claim.mutate(d.id)} style={s.quick} />
      : can.editor ? <Button title={t("proDocSheet.act.editor")} icon="edit-3" size="sm" variant="soft" onPress={() => router.push(editorPath(d.id))} style={s.quick} /> : null;
  };
  const empty = q.isLoading ? (
    <View style={s.gap}>{[0, 1, 2, 3].map((i) => <DocRowSkeleton key={i} />)}</View>
  ) : q.isError ? (
    <ErrorView error={q.error} onRetry={() => void q.refetch()} />
  ) : (
    <EmptyState icon="file-text" title={filtered ? t("ad1.emptyFiltered") : t("ad1.empty")} text={filtered ? t("ad1.emptyFilteredText") : t(`ad1.emptyText.${tab}`)} actionLabel={filtered ? t("proDocSheet.reset") : undefined} onAction={filtered ? f.reset : undefined} />
  );
  return (
    <AdminPage title={t("ad1.title")} subtitle={q.data ? t("proDocSheet.count", { n: counts.all ?? q.data.length }) : t("ad1.subtitle")}>
      <FlatList
        data={q.isLoading || q.isError ? [] : rows}
        keyExtractor={(d) => d.id}
        renderItem={({ item, index }) => <DocRow doc={item} index={index} onPress={() => setOpen(item.id)} action={quick(item)} />}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        ListHeaderComponent={<DocListHead tab={tab} onTab={setTab} counts={counts} f={f} total={items.length} flows={flowCounts(q.data ?? [])} />}
        ListEmptyComponent={empty}
        ListFooterComponent={rows.length ? <DocListFooter page={page} onMore={() => query.fetchNextPage()} /> : null}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 28 }]}
        refreshing={q.isRefetching}
        onRefresh={() => void q.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
      <DocSheet id={shown} row={rows.find((d) => d.id === shown)} visible={!!open} onClose={() => setOpen("")} onDetail={(id) => later(() => router.push(docPath(id)))} onEditor={(id) => later(() => router.push(editorPath(id)))} onTransfer={(d) => later(() => setMove(d))} />
      <TransferSheet doc={move} onClose={() => setMove(null)} onDone={() => setMove(null)} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ content: { paddingHorizontal: 16, flexGrow: 1 }, gap: { gap: 12 }, sep: { height: 10 }, quick: { minHeight: 44, alignSelf: "flex-start" } });
