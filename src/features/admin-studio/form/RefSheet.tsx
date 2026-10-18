import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useReference } from "@/entities/admin-studio";
import { BottomSheet, Button, Chip, EmptyState, Icon, Input, SheetScroll, Skeleton } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { rememberRefs } from "./refLabels";

type Props = { visible: boolean; onClose: () => void; title: string; source: string; value: string[]; multi?: boolean; onPick: (v: string[]) => void };

// Server-searched list of reference values (services, categories, roles …). One pick closes the sheet.
export function RefSheet({ visible, onClose, title, source, value, multi, onPick }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const query = useReference(source, useDebounced(q, 300), visible);
  rememberRefs(query.data);
  const toggle = (v: string) => (multi ? onPick(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]) : (onPick([v]), onClose()));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[0.7, 0.94]}>
      <View style={s.search}><Input value={q} onChangeText={setQ} placeholder={t("adm.search")} left={<Icon name="search" size={18} tone="gray" />} autoCapitalize="none" autoCorrect={false} /></View>
      <SheetScroll>
        {query.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={52} round={14} />) : null}
        {query.data?.map((r) => <Chip key={r.value} label={r.label} active={value.includes(r.value)} onPress={() => toggle(r.value)} />)}
        {query.data && !query.data.length ? <EmptyState compact icon="search" title={t("adm.noData")} /> : null}
        {!multi && value.length ? <Button title={t("adm.reset")} variant="line" onPress={() => { onPick([]); onClose(); }} /> : null}
      </SheetScroll>
      {multi ? <View style={s.bar}><Button title={t("adm.done")} onPress={onClose} variant="gradient" full /></View> : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({ search: { paddingHorizontal: 18, paddingBottom: 8 }, bar: { padding: 18, paddingTop: 8 } });
