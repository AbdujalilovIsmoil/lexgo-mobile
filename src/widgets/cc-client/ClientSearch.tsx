import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { BusinessHours, ClientRow, soft, useClientSearch, useRecentClients, type CcClient } from "@/entities/admin-callcenter";
import { EmptyState, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { TabList } from "@/shared/ui/cc";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Mijozlar tab body: search by name, phone or LexGo ID (as you type, from 2 characters); with no query the clients
// opened lately. A row opens the client card.
export function ClientSearch({ bottomPad }: { bottomPad: number }) {
  const { t } = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const term = useDebounced(q.trim(), 350);
  const res = useClientSearch(term);
  const recent = useRecentClients((s) => s.items);
  const load = useRecentClients((s) => s.load);
  useEffect(() => void load(), [load]);
  const searching = term.length >= 2;
  const forbidden = res.error instanceof ApiError && res.error.status === 403;
  const open = (c: CcClient) => router.push({ pathname: "/cc/clients/[id]", params: { id: c.id, name: c.name, phone: c.phone } } as never);
  const head = (
    <View style={s.head}>
      <SearchBox value={q} onChangeText={setQ} placeholder={t("cc2.searchPh")} />
      <View style={s.hours}><BusinessHours /></View>
      {!searching && recent.length ? <Text variant="small" weight="bold" tone="gray" style={s.label}>{t("cc2.recent")}</Text> : null}
    </View>
  );
  if (searching && forbidden) return <>{head}<EmptyState icon="lock" title={t("adm.noAccess")} text={t("admCcB.searchNoAccess")} /></>;
  const list = searching ? res.data ?? [] : recent;
  const query = searching ? soft(res) : { isLoading: false, isError: false, error: null, refetch: () => undefined, isRefetching: false };
  return (
    <TabList
      data={list}
      query={query}
      keyExtractor={(c) => c.id}
      header={head}
      bottomPad={bottomPad}
      empty={searching ? { icon: "users", title: t("admCcB.noResults"), text: t("cc2.noResultsText") } : { icon: "search", title: t("admCcB.search"), text: t("cc2.searchHint") }}
      renderItem={(c) => <ClientRow client={c} onPress={() => open(c)} />}
    />
  );
}

const s = StyleSheet.create({ head: { gap: 10, paddingBottom: 12, marginHorizontal: -16 }, hours: { paddingHorizontal: 16 }, label: { paddingHorizontal: 16 } });
