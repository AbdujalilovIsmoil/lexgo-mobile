import { Image, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheet, SheetScroll } from "@/shared/ui/sheet";
import { Card, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const OPTS = [
  { k: "Advocate", href: "/urgent", art: require("../../../assets/dash/card-advokatga-tezkor-boglanish.png") },
  { k: "Ai", href: "/(tabs)/ai", art: require("../../../assets/dash/card-lexgo-ai-sorash.png") },
] as const;

// The "Kimdan maslahat olasiz?" modal: two options with perks and a call to action.
export function WhoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("cdash.act.whoTitle")} snaps={[0.8, 0.95]}>
      <SheetScroll>
        <Text variant="body" tone="gray">{t("cdash.act.whoLead")}</Text>
        {OPTS.map((o) => (
          <Card key={o.k} style={s.card}>
            <Image source={o.art} style={s.art} />
            <Text variant="h4" style={s.pad}>{t(`cdash.act.who${o.k}`)}</Text>
            <Text variant="small" tone="gray" style={s.pad}>{t(`cdash.act.who${o.k}Sub`)}</Text>
            {[1, 2].map((n) => (
              <View key={n} style={s.perk}><Icon name="check-circle" size={16} tone="accent" /><Text variant="small">{t(`cdash.act.who${o.k}Perk${n}`)}</Text></View>
            ))}
            <PressableScale style={s.cta} onPress={() => { onClose(); router.navigate(o.href as never); }}>
              <Text variant="body" weight="bold" tone="white">{t(`cdash.act.who${o.k}Cta`)}</Text>
              <Icon name="arrow-right" size={18} tone="white" />
            </PressableScale>
          </Card>
        ))}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, marginTop: 14 },
  art: { position: "absolute", right: -10, top: -6, width: 110, height: 110, opacity: 0.9, resizeMode: "contain" },
  pad: { paddingRight: 84 },
  perk: { flexDirection: "row", alignItems: "center", gap: 8 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 999, backgroundColor: "#1668F0", marginTop: 6 },
});
