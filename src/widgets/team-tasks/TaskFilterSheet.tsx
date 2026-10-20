import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, IconButton, SheetOption, SheetScroll, Text } from "@/shared/ui";
import { RangeCalendar, useDateRange } from "@/shared/ui/admin";
import { useTaskUsers, EMPTY_FILTER, type TaskFilter } from "@/entities/team-tasks";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; value: TaskFilter; onApply: (f: TaskFilter) => void };

// Assignee (anyone, me, unassigned, or one person) and the deadline range on a calendar, in one bottom sheet; nothing changes until
// "Apply". The status is the bar above the list, the search its box.
export function TaskFilterSheet({ visible, onClose, value, onApply }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const users = useTaskUsers("", visible);
  const [who, setWho] = useState(value.assignee);
  const bar = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setWho(value.assignee);
      bar.setFrom(value.from);
      bar.setTo(value.to);
    }
  }
  const people = [{ value: "", label: t("ttm.filter.anyone") }, { value: "me", label: t("ttm.filter.me") }, { value: "unassigned", label: t("ttm.filter.unassigned") }, ...(users.data ?? []).map((p) => ({ value: p.id, label: p.name || p.lexgoId }))];
  const apply = () => { onApply({ ...value, assignee: who, from: bar.from, to: bar.to || bar.from }); onClose(); };
  const reset = () => { setWho(""); bar.setFrom(""); bar.setTo(""); };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ttm.filter.title")} snaps={[0.85, 0.95]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("ttm.filter.assignee")}</Text>
            {people.map((p) => <SheetOption key={p.value} on={who === p.value} label={p.label} onPress={() => setWho(p.value)} />)}
          </View>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("ttm.filter.deadline")}</Text>
            <RangeCalendar from={bar.from} to={bar.to} onChange={(f, e) => { bar.setFrom(f); bar.setTo(e); }} />
          </View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("ttm.filter.reset")} onPress={reset} />
          <Button title={t("ttm.filter.apply")} variant="gradient" full style={s.flex} onPress={apply} />
        </View>
      </View>
    </BottomSheet>
  );
}

export const filterCount = (f: TaskFilter): number => [f.assignee, f.from].filter(Boolean).length;
export { EMPTY_FILTER };

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8, marginBottom: 20 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
