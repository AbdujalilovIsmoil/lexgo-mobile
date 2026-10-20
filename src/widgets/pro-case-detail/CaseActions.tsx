import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { ProCase } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { openTel } from "@/shared/lib/links";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { item: ProCase; phone?: string; roomId: string; onManage: () => void };

// Round-icon shortcuts under the hero: manage (always), call the client, open the private chat, open the order — only those that exist.
export function CaseActions({ item, phone, roomId, onManage }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const all: ({ key: string; icon: IconName; label: string; on: () => void } | false)[] = [
    { key: "manage", icon: "edit-2", label: t("csd.manage"), on: onManage },
    !!phone && { key: "call", icon: "phone", label: t("csd.call"), on: () => openTel(phone) },
    !!roomId && { key: "chat", icon: "message-circle", label: t("csd.chat"), on: () => router.push(`/chat/${roomId}` as never) },
    !!item.orderId && { key: "order", icon: "shopping-bag", label: t("csd.order"), on: () => router.push(`/pro/orders/${item.orderId}` as never) },
  ];
  return (
    <View style={s.row}>
      {all.filter((x): x is Exclude<typeof x, false> => !!x).map((x) => (
        <PressableScale key={x.key} onPress={x.on} accessibilityLabel={x.label} style={[s.btn, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={x.icon} size={19} tone="accent" /></View>
          <Text variant="caption" weight="bold" numberOfLines={1}>{x.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: 18, borderWidth: 1 },
  ico: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
