import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRecentClients, type CcClient } from "@/entities/admin-callcenter";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Recently opened" rail under the search field: tap an avatar to reopen that client's card.
export function RecentClients({ onOpen }: { onOpen: (c: CcClient) => void }) {
  const { t } = useT();
  const { items, load } = useRecentClients();
  useEffect(() => { void load(); }, [load]);
  if (!items.length) return null;
  return (
    <>
      <Text variant="kicker" tone="gray2" style={s.kicker}>{t("admCcH.recent").toUpperCase()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {items.map((c) => (
          <PressableScale key={c.id} onPress={() => onOpen(c)} style={s.item} accessibilityRole="button">
            <Avatar name={c.name || c.phone} size={56} />
            <Text variant="caption" weight="semibold" numberOfLines={1} center>{c.name || c.phone}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({ kicker: { paddingHorizontal: 20, marginTop: 8 }, row: { paddingHorizontal: 16, gap: 14, paddingVertical: 10 }, item: { width: 66, alignItems: "center", gap: 6 } });
