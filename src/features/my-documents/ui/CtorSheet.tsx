import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheet, Button, Icon, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; title: string; message: string; onYes: () => void; onClose: () => void };

// "Your work went to the duty advocate — will you also fill it in yourself?" as a drawer: a shield badge, the server's own
// title and sentence, and the two answers (fill it in myself / wait for the advocate) as two stacked buttons.
export function CtorSheet({ visible, title, message, onYes, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={[0.5, 0.7]}>
      <View style={s.body}>
        <LinearGradient colors={["#00A870", "#0B6E6E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badge}>
          <Icon name="shield" size={30} tone="white" />
          <View style={s.tick}><Icon name="check" size={14} color="#00A870" /></View>
        </LinearGradient>
        <Text variant="h3" center>{title}</Text>
        <View style={[s.note, { backgroundColor: c.surface2, borderColor: c.line }]}>
          <Icon name="edit-3" size={18} tone="accent" />
          <Text variant="small" tone="gray" style={s.flex}>{message}</Text>
        </View>
        <Button title={t("dm3.ctorYes")} icon="edit-3" variant="gradient" size="lg" full onPress={() => { onClose(); onYes(); }} />
        <Button title={t("dm3.ctorNo")} icon="clock" variant="soft" full onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { gap: 14, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, alignItems: "stretch" },
  badge: { alignSelf: "center", width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tick: { position: "absolute", right: -6, bottom: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: radius.r, borderWidth: 1 },
  flex: { flex: 1 },
});
