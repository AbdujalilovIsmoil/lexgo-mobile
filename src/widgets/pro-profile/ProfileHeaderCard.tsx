import { StyleSheet, View } from "react-native";
import type { ProProfile } from "@/entities/pro-profile";
import { radius, useColors } from "@/shared/theme";
import { Avatar, Card, Icon, PressableScale, Pill, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { profile: ProProfile; name: string; avatarUrl: string; percent: number; onPhoto: () => void };

// Photo (tap to change), name, public ID, kind and verification pills, and how complete the profile is.
export function ProfileHeaderCard({ profile: p, name, avatarUrl, percent, onPhoto }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <PressableScale onPress={onPhoto} accessibilityLabel={t("sl5.photo.title")}>
          <Avatar name={name || p.name} uri={avatarUrl || undefined} size={72} />
          <View style={[s.cam, { backgroundColor: c.accent, borderColor: c.surface }]}><Icon name="camera" size={13} color="#fff" /></View>
        </PressableScale>
        <View style={s.col}>
          <Text variant="h3" numberOfLines={2}>{name || p.name || "—"}</Text>
          {p.publicId ? <Text variant="caption" tone="gray">{p.publicId}</Text> : null}
          <View style={s.pills}>
            <Pill label={t(`sl1.kind.${p.sellerType || "yurist"}`)} small />
            <Pill label={t(p.verified ? "sl1.verified" : "sl1.unverified")} tone={p.verified ? "ok" : "warn"} icon={p.verified ? "check-circle" : "clock"} small />
          </View>
        </View>
      </View>
      <View style={s.bar}>
        <View style={s.barHead}>
          <Text variant="caption" tone="gray">{t("sl4.completeness")}</Text>
          <Text variant="caption" weight="bold">{percent}%</Text>
        </View>
        <ProgressBar value={percent / 100} color={percent >= 100 ? c.ok : c.accent} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  col: { flex: 1, gap: 4 },
  pills: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 2 },
  cam: { position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: radius.pill, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bar: { gap: 6 },
  barHead: { flexDirection: "row", justifyContent: "space-between" },
});
