import { View } from "react-native";
import { Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { labelOf } from "../model/json";
import { readinessTone } from "../model/readiness";
import type { ReadinessItem } from "../model/types";

// One line of the production-readiness checklist: pass / waiting / missing, with the backend's note.
export function ReadinessRow({ item }: { item: ReadinessItem }) {
  const { t } = useT();
  const c = useColors();
  const tone = readinessTone(item.status);
  const key = `admPolB.ready.${item.status}`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
      <Icon name={tone === "ok" ? "check-circle" : tone === "warn" ? "clock" : "alert-circle"} size={20} color={tone === "ok" ? c.ok : tone === "warn" ? c.warn : c.err} />
      <View style={{ flex: 1 }}>
        <Text variant="small" weight="semibold">{item.title ? labelOf(item.title) : labelOf(item.key)}</Text>
        {item.note ? <Text variant="caption" tone="gray">{item.note}</Text> : null}
      </View>
      <Pill small tone={tone} label={t(key) !== key ? t(key) : item.status || "—"} />
    </View>
  );
}
