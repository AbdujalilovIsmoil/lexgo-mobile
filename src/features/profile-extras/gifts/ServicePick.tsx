import { useState } from "react";
import { View } from "react-native";
import { useServiceSearch } from "@/entities/service";
import { Icon, Input, PressableScale, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { value: { id: string; name: string } | null; onPick: (s: { id: string; name: string } | null) => void };

// Search the catalogue (server side, 2+ letters) and pick the service to gift.
export function ServicePick({ value, onPick }: Props) {
  const c = useColors();
  const { t } = useT();
  const [q, setQ] = useState("");
  const res = useServiceSearch(useDebounced(q, 350));
  if (value) {
    return (
      <PressableScale onPress={() => onPick(null)} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, backgroundColor: c.tint }}>
        <Icon name="check-circle" size={18} color={c.ok} />
        <Text variant="body" weight="semibold" style={{ flex: 1 }}>{value.name}</Text>
        <Icon name="x" size={16} tone="gray" />
      </PressableScale>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <Input label={t("py8.service")} value={q} onChangeText={setQ} placeholder={t("py8.servicePh")} left={<Icon name="search" size={18} tone="gray" />} />
      {(res.data ?? []).slice(0, 6).map((s) => (
        <PressableScale key={s.id} onPress={() => onPick({ id: s.id, name: s.name })} style={{ padding: 12, borderRadius: 12, backgroundColor: c.surface2 }}>
          <Text variant="small" weight="semibold">{s.name}</Text>
        </PressableScale>
      ))}
    </View>
  );
}
