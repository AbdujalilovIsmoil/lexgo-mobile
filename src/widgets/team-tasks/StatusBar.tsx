import { ScrollView } from "react-native";
import { Chip } from "@/shared/ui";
import { TASK_STATUSES, type TaskStatus } from "@/entities/team-tasks";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export const useStatusColor = () => {
  const c = useColors();
  return (s: TaskStatus): string => ({ new: c.gray, in_progress: c.accent, testing: c.warn, ready: c.ok })[s];
};

type Props = { value: TaskStatus | ""; onChange: (v: TaskStatus | "") => void; counts?: Record<string, number>; total?: number };

// The four statuses (and "All") as one scrolling row with their live counts.
export function StatusBar({ value, onChange, counts, total }: Props) {
  const { t } = useT();
  const color = useStatusColor();
  const sum = TASK_STATUSES.reduce((n, s) => n + (counts?.[s] ?? 0), 0);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16, flexGrow: 0 }}>
      <Chip label={`${t("ttm.all")}${counts ? ` · ${total ?? sum}` : ""}`} active={value === ""} onPress={() => onChange("")} />
      {TASK_STATUSES.map((s) => <Chip key={s} label={`${t(`ttm.status.${s}`)}${counts ? ` · ${counts[s] ?? 0}` : ""}`} color={color(s)} active={value === s} onPress={() => onChange(value === s ? "" : s)} />)}
    </ScrollView>
  );
}
