import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApiError } from "@/shared/api";
import { useClientSearch, type CcClient } from "@/entities/admin-callcenter";
import { BottomSheet, Button, EmptyState, ErrorView, Icon, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { RowCard, SearchBox } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import type { Picked } from "../model/useRecipients";

type Props = { visible: boolean; onClose: () => void; picked: Picked[]; onToggle: (c: Picked) => void };

// Pick the clients to notify: search by name or phone (call-center directory), tap to select, selection survives new searches.
export function ClientPickSheet({ visible, onClose, picked, onToggle }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const term = useDebounced(q.trim(), 350);
  const res = useClientSearch(term);
  const has = (c: CcClient) => picked.some((p) => p.id === c.id);
  const denied = res.error instanceof ApiError && res.error.status === 403;
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("cc3.pickTitle")} subtitle={t("cc3.selectedN", { n: picked.length })} snaps={[0.7, 0.94]}>
      <View style={s.search}><SearchBox value={q} onChangeText={setQ} placeholder={t("cc2.searchPh")} /></View>
      <SheetScroll>
        {term.length < 2 ? <EmptyState compact icon="search" title={t("admCcB.search")} text={t("cc2.searchHint")} /> : null}
        {res.isLoading && term.length >= 2 ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} round={20} />) : null}
        {res.isError ? denied ? <Text variant="small" tone="gray" center>{t("admCcB.searchNoAccess")}</Text> : <ErrorView error={res.error} compact onRetry={() => void res.refetch()} /> : null}
        {res.data && !res.data.length && term.length >= 2 ? <EmptyState compact icon="user-x" title={t("admCcB.noResults")} /> : null}
        {(res.data ?? []).map((c) => (
          <RowCard key={c.id} avatar={c.name || c.phone} title={c.name || c.phone} subtitle={[c.lexgoId, c.phone].filter(Boolean).join(" · ")} right={has(c) ? <Icon name="check-circle" size={22} tone="accent" /> : undefined} onPress={() => onToggle({ id: c.id, name: c.name || c.phone })} />
        ))}
      </SheetScroll>
      <View style={s.done}><Button title={t("adm.done")} variant="gradient" full onPress={onClose} /></View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ search: { marginTop: 4 }, done: { padding: 18, paddingTop: 8 } });
