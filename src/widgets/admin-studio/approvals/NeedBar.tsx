import { ScrollView } from "react-native";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { NEEDS, type Need } from "./queueCore";

const ICON = { review: "eye", publish: "upload-cloud", returned: "rotate-ccw" } as const;
type Props = { value: Need | ""; onChange: (v: Need | "") => void; counts: Record<Need | "all", number> };

// "Task": Review · Publish · Returned · All, each with its icon and how many are waiting (as on the web).
export function NeedBar({ value, onChange, counts }: Props) {
  const { t } = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16, flexGrow: 0 }}>
      {NEEDS.map((k) => <Chip key={k} icon={ICON[k]} label={`${t(`admStudioD.appr.needs.${k}`)} · ${counts[k]}`} active={value === k} onPress={() => onChange(value === k ? "" : k)} />)}
      <Chip icon="list" label={`${t("admStudioD.appr.all")} · ${counts.all}`} active={value === ""} onPress={() => onChange("")} />
    </ScrollView>
  );
}
