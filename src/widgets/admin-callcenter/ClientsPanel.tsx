import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApiError } from "@/shared/api";
import { BusinessHours, soft, useClientSearch, type CcClient } from "@/entities/admin-callcenter";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { EmptyState } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { ClientSheet } from "./ClientSheet";
import { ClientTicket } from "./kit/ClientTicket";
import { RecentClients } from "./kit/RecentClients";

// Client lookup by name or phone (from 2 characters, as you type); a result opens the 360 card.
export function ClientsPanel({ canLog, initial = "" }: { canLog: boolean; initial?: string }) {
  const { t } = useT();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState<CcClient | null>(null);
  const term = useDebounced(q.trim(), 350);
  const res = useClientSearch(term);
  const forbidden = res.error instanceof ApiError && res.error.status === 403;
  return (
    <View style={s.fill}>
      <View style={s.head}>
        <SearchBox value={q} onChangeText={setQ} placeholder={t("admCcB.searchPh")} />
        <View style={s.hours}><BusinessHours /></View>
      </View>
      {term.length < 2 ? (
        <><RecentClients onOpen={setOpen} /><EmptyState icon="search" title={t("admCcB.search")} text={t("admCcB.searchHint")} /></>
      ) : forbidden ? (
        <EmptyState icon="lock" title={t("adm.noAccess")} text={t("admCcB.searchNoAccess")} />
      ) : (
        <PagedList data={res.data ?? []} query={soft(res)} keyExtractor={(c) => c.id} empty={{ icon: "users", title: t("admCcB.noResults") }} renderItem={(c) => <ClientTicket client={c} onPress={() => setOpen(c)} />} />
      )}
      <ClientSheet client={open} canLog={canLog} onClose={() => setOpen(null)} />
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, head: { gap: 8, paddingBottom: 8 }, hours: { paddingHorizontal: 16 } });
