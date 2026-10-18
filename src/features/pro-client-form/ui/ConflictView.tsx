import { View } from "react-native";
import type { ConflictResult } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { Card, Icon, Text } from "@/shared/ui";

// Result of a conflict check: green "clear" or an amber list of matches with the reason.
export function ConflictView({ r }: { r: ConflictResult }) {
  const { t } = useT();
  if (r.clear) {
    return (
      <Card tinted style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Icon name="check-circle" size={20} tone="accent" />
        <Text variant="small" weight="bold">{t("aw3.chk.clear")}</Text>
      </Card>
    );
  }
  return (
    <Card style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Icon name="alert-triangle" size={18} color="#F59E0B" />
        <Text variant="small" weight="bold" style={{ flex: 1 }}>{t("aw3.chk.potential")}</Text>
      </View>
      {r.matches.slice(0, 8).map((m, i) => <Text key={i} variant="small" tone="gray">{`• ${m.title || "—"} — ${tOr(t, `aw3.reason.${m.reason}`, m.reason)}`}</Text>)}
    </Card>
  );
}
