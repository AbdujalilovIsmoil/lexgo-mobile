import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { UserRow, useAdminUsers, type UserHit } from "@/entities/admin-users";
import { ROLE_TABS, type RoleTab } from "@/entities/admin-notify";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { BottomSheet, Button, EmptyState, ErrorView, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

const PAGE = 60;
type Props = { visible: boolean; onClose: () => void; selected: UserHit[]; onChange: (list: UserHit[]) => void };

// Pick recipients across roles: role tabs, server-side search, select everyone shown, selection survives tab switches.
export function RecipientSheet({ visible, onClose, selected, onChange }: Props) {
  const { t } = useT();
  const [role, setRole] = useState<RoleTab>("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const query = useAdminUsers({ role: role === "all" ? undefined : role, q: useDebounced(q.trim(), 300) || undefined });
  const users = query.data ?? [];
  const has = (u: UserHit) => selected.some((s) => s.id === u.id);
  const toggle = (u: UserHit) => onChange(has(u) ? selected.filter((s) => s.id !== u.id) : [...selected, u]);
  const count = (r: RoleTab) => selected.filter((u) => r === "all" || u.role === r).length;
  const tabs = ROLE_TABS.map((r) => ({ value: r, label: `${t(`admNtf.roles.${r}`)}${count(r) ? ` · ${count(r)}` : ""}` }));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("admNtfB.recipients")} subtitle={t("admNtfB.selectedN", { n: selected.length })} snaps={[0.78, 0.95]}>
      <ChipBar options={tabs} value={role} onChange={(r) => { setRole(r); setShown(PAGE); }} />
      <View style={s.gap}><SearchBox value={q} onChangeText={(v) => { setQ(v); setShown(PAGE); }} placeholder={t("admNtfB.searchPh")} /></View>
      <View style={s.bar}>
        <Button title={t("admNtfB.selectAll")} variant="soft" size="sm" disabled={!users.length} onPress={() => onChange([...selected, ...users.filter((u) => !has(u))])} />
        <Button title={t("admNtfB.clear")} variant="line" size="sm" disabled={!selected.length} onPress={() => onChange([])} />
        <Text variant="caption" tone="gray">{t("admNtfB.shownN", { n: users.length })}</Text>
      </View>
      <SheetScroll>
        {query.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} round={20} />) : null}
        {query.isError ? <><ErrorView error={query.error} compact /><Text variant="small" tone="gray" center>{t("admNtfB.usersError")}</Text></> : null}
        {query.data && !users.length ? <EmptyState compact icon="user-x" title={t("admNtfB.noUsers")} /> : null}
        {users.slice(0, shown).map((u) => <UserRow key={u.id} user={u} selected={has(u)} onPress={() => toggle(u)} />)}
        {users.length > shown ? <Button title={t("adm.loadMore")} variant="soft" full onPress={() => setShown(shown + PAGE)} /> : null}
      </SheetScroll>
      <View style={s.done}><Button title={t("adm.done")} variant="gradient" full onPress={onClose} /></View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ gap: { marginTop: 4 }, bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 10 }, done: { padding: 18, paddingTop: 8 } });
