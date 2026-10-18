import { View } from "react-native";
import { BottomSheet, Card, Icon, Pill, SheetScroll, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { kindIcon, useUrgentLabels, type UrgentCard } from "@/entities/urgent";

type Props = { card: UrgentCard | null; onClose: () => void; onPick: (key: string) => void };

// Step one of a grouped box: which kind exactly (ordinary vs express video, single vs panel second opinion).
export function KindSheet({ card, onClose, onPick }: Props) {
  const { t } = useT();
  const label = useUrgentLabels();
  return (
    <BottomSheet visible={!!card} onClose={onClose} title={card ? label.text(`ug1.groups.${card.key}`, card.group?.title ?? "") : ""} snaps={[0.6, 0.9]}>
      <SheetScroll>
        {card ? <Text variant="small" tone="gray">{t(`ug1.about.${card.key}`)}</Text> : null}
        {card?.items.map((s) => (
            <Card key={s.key} onPress={() => onPick(s.key)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
              <Icon name={kindIcon(s.key)} size={22} tone="accent" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="body" weight="bold">{label.kind(s.key, s.title)}</Text>
                <Text variant="small" tone="gray">{t(`ug1.about.${s.key}`)}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {s.immediateCall ? <Pill small tone="warn" icon="zap" label={t("ug4.now")} /> : null}
                  {s.requiresPriorPurchase ? <Pill small tone="warn" icon="lock" label={t("ug1.priorShort")} /> : null}
                </View>
              </View>
              <Icon name="chevron-right" size={18} tone="gray" />
            </Card>
        ))}
      </SheetScroll>
    </BottomSheet>
  );
}
