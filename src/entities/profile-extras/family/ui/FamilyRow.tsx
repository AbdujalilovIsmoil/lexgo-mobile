import { View } from "react-native";
import { Avatar, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { FieldCard } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { RemoveX } from "../../ui/RemoveX";
import type { FamilyMember } from "../types";

type Props = { item: FamilyMember; onPress?: () => void; onShare?: () => void; onRemove?: () => void };

// One family member; "allowed" means they may use the owner's active plan. onShare makes the pill a toggle.
export function FamilyRow({ item, onPress, onShare, onRemove }: Props) {
  const { t } = useT();
  const c = useColors();
  const on = item.sharedAccess;
  const tint = on ? c.ok : c.gray2;
  const toggle = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, backgroundColor: on ? c.okBg : c.surface }}>
      <Icon name={on ? "check-circle" : "minus-circle"} size={14} color={tint} />
      <Text variant="caption" weight="bold" style={{ color: tint }}>{t(on ? "py6.shared" : "py6.notShared")}</Text>
    </View>
  );
  return (
    <FieldCard style={{ gap: 10 }}>
      <PressableScale disabled={!onPress} onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={item.name || item.phone} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body" weight="bold" numberOfLines={1}>{item.name || item.phone}</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{item.phone}</Text>
        </View>
        {onRemove ? <RemoveX onPress={onRemove} /> : null}
      </PressableScale>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {item.relation ? <Pill label={item.relation} tone="blue" small /> : <View />}
        {onShare ? <PressableScale onPress={onShare} hitSlop={8}>{toggle}</PressableScale> : toggle}
      </View>
    </FieldCard>
  );
}
