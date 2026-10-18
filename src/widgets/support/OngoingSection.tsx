import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TicketRow, type SupportTicket } from "@/entities/support";

type Props = { items: SupportTicket[]; more?: boolean; onAll: () => void };
const SHOWN = 3;

// Ongoing chats first (up to three, with unread badges), like the web hub's "continue" block.
export function OngoingSection({ items, more, onAll }: Props) {
  const { t } = useT();
  const router = useRouter();
  if (!items.length) return null;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="h4">{t("sp1.ongoing")} ({items.length}{more ? "+" : ""})</Text>
        <Button title={t("sp1.all")} variant="ghost" size="sm" onPress={onAll} />
      </View>
      {items.slice(0, SHOWN).map((tk) => <TicketRow key={tk.id} item={tk} onPress={() => router.push(`/support/${encodeURIComponent(tk.id)}` as never)} />)}
    </View>
  );
}
