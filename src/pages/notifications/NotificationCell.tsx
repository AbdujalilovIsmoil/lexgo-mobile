import { View } from "react-native";
import { NotificationRow, type Notification } from "@/entities/notification";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { dayKey } from "./dayGroup";

type Props = { item: Notification; prev?: Notification; onPress: () => void; onOpen?: () => void };

// One list cell: a day heading when this event starts a new group (the order of the list is not changed), then the card.
export function NotificationCell({ item, prev, onPress, onOpen }: Props) {
  const { t } = useT();
  const k = dayKey(item.createdAt);
  const heading = !prev || dayKey(prev.createdAt) !== k;
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
      {heading ? <Text variant="small" weight="bold" tone="gray" style={{ marginTop: prev ? 10 : 2, marginBottom: 8, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{t(`ntd.${k}`)}</Text> : null}
      <NotificationRow item={item} onPress={onPress} onOpen={onOpen} />
    </View>
  );
}
