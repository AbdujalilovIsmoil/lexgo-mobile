import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, EmptyState, SheetOption, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useTaskUsers, type Person } from "@/entities/team-tasks";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; value: Person[]; onDone: (people: Person[]) => void; title?: string };

// A searchable multi-select of the people who may be given a task (name, LexGo ID or phone). Several can be ticked; "Done" returns the
// ids. Nobody picked is allowed: the task is then unassigned.
export function AssigneesSheet({ visible, onClose, value, onDone, title }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Person[]>(value);
  const dq = useDebounced(q, 300);
  const users = useTaskUsers(dq, visible);
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) { setPicked(value); setQ(""); }
  }
  const toggle = (p: Person) => setPicked((x) => (x.some((y) => y.id === p.id) ? x.filter((y) => y.id !== p.id) : [...x, p]));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title ?? t("ttm.form.assignees")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <View style={{ marginHorizontal: -2, paddingTop: 4 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("ttm.form.assigneesSearch")} /></View>
        <SheetScroll>
          {users.isLoading ? <View style={{ gap: 8 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={50} round={14} />)}</View> : null}
          {!users.isLoading && !users.data?.length ? <EmptyState icon="users" title={t("ttm.form.assigneesEmpty")} compact /> : null}
          {(users.data ?? []).map((p) => <SheetOption key={p.id} on={picked.some((y) => y.id === p.id)} label={`${p.name || p.lexgoId}${p.lexgoId ? `  ·  ${p.lexgoId}` : ""}`} onPress={() => toggle(p)} />)}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 12 }]}>
          <Text variant="small" tone="gray" style={s.flex}>{t("ttm.peopleCount", { n: picked.length })}</Text>
          <Button title={t("ttm.form.done")} variant="gradient" onPress={() => { onDone(picked); onClose(); }} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ flex: { flex: 1 }, bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingHorizontal: 18, borderTopWidth: 1 } });
