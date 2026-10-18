import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { UserRow, useUserSearch, type UserHit } from "@/entities/admin-users";
import { BottomSheet, Button, EmptyState, Icon, Input, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Single pick: called with the tapped user and the sheet closes. */
  onPick?: (u: UserHit) => void;
  /** Multi pick: the selection is controlled by the caller; a "Done" button closes the sheet. */
  selected?: UserHit[];
  onChange?: (list: UserHit[]) => void;
};

// Find people by name, phone or LexGo id (GET /users/search) and pick one or many.
export function UserPickerSheet({ visible, onClose, title, onPick, selected = [], onChange }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const query = useUserSearch(useDebounced(q, 300));
  const multi = !!onChange;
  const tap = (u: UserHit) => {
    if (multi) onChange(selected.some((s) => s.id === u.id) ? selected.filter((s) => s.id !== u.id) : [...selected, u]);
    else {
      onPick?.(u);
      onClose();
    }
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={multi ? t("admSt.picked", { n: selected.length }) : undefined} snaps={[0.7, 0.94]}>
      <View style={s.search}><Input value={q} onChangeText={setQ} placeholder={t("admSt.userSearchPh")} left={<Icon name="search" size={18} tone="gray" />} autoCapitalize="none" autoCorrect={false} /></View>
      <SheetScroll>
        {query.isFetching && !query.data ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} round={20} />) : null}
        {query.data?.map((u) => <UserRow key={u.id} user={u} selected={selected.some((x) => x.id === u.id)} onPress={() => tap(u)} />)}
        {query.data && !query.data.length ? <EmptyState compact icon="user-x" title={t("admSt.userNone")} /> : null}
        {q.trim().length < 2 ? <Text variant="small" tone="gray" center>{t("admSt.userHint")}</Text> : null}
      </SheetScroll>
      {multi ? <View style={s.bar}><Button title={t("adm.done")} onPress={onClose} variant="gradient" full /></View> : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({ search: { paddingHorizontal: 18, paddingBottom: 8 }, bar: { padding: 18, paddingTop: 8 } });
