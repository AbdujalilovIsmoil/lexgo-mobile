import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, EmptyState, Icon, Input, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { usePeople, type Person } from "../model/usePeople";
import { PersonRow } from "./PersonRow";

type Props = {
  visible: boolean; onClose: () => void; title: string; subtitle?: string; me: string; note?: ReactNode;
  onPick?: (p: Person) => void; // single pick: the sheet stays open, the caller closes it
  selected?: Person[]; onChange?: (list: Person[]) => void; // multi pick with a Done button
  busyId?: string;
};

// Find a person (name / phone / public id) and pick one or several. Works for every role (see usePeople).
export function PeopleSheet({ visible, onClose, title, subtitle, me, note, onPick, selected = [], onChange, busyId }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const people = usePeople(useDebounced(q, 300), me, visible);
  const multi = !!onChange;
  const tap = (p: Person) => (multi ? onChange(selected.some((x) => x.id === p.id) ? selected.filter((x) => x.id !== p.id) : [...selected, p]) : onPick?.(p));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={multi ? t("admSt.picked", { n: selected.length }) : subtitle} snaps={[0.7, 0.94]}>
      <View style={s.pad}><Input value={q} onChangeText={setQ} placeholder={t("admSt.userSearchPh")} left={<Icon name="search" size={18} tone="gray" />} autoCapitalize="none" autoCorrect={false} /></View>
      {note}
      <SheetScroll>
        {people.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} round={20} />) : null}
        {people.data?.map((p) => <PersonRow key={p.id} person={p} selected={selected.some((x) => x.id === p.id) || busyId === p.id} onPress={() => tap(p)} />)}
        {people.data && !people.data.length ? <EmptyState compact icon="user-x" title={t("admSt.userNone")} /> : null}
        {people.isError ? <Text variant="small" tone="err" center>{t("common.serverError")}</Text> : null}
      </SheetScroll>
      {multi ? <View style={s.pad}><Button title={t("adm.done")} onPress={onClose} variant="gradient" full /></View> : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({ pad: { paddingHorizontal: 18, paddingVertical: 8 } });
