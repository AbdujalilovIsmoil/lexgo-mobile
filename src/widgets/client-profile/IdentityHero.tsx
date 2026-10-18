import { View } from "react-native";
import { Avatar, GradientBox, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { useShareReferral } from "@/features/profile-extras";
import { useT } from "@/shared/i18n";

type Props = { name: string; uri?: string; lexgoId?: string; verified?: boolean; onEdit: () => void };

// Gradient "identity card" of the personal panel: small avatar with a pencil badge, name, verified tag, copyable ID.
export function IdentityHero({ name, uri, lexgoId, verified, onEdit }: Props) {
  const { t } = useT();
  const { copy } = useShareReferral();
  return (
    <GradientBox round={18} style={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <PressableScale onPress={onEdit} accessibilityLabel={t("py9.edit")}>
          <View style={{ borderRadius: 32, borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" }}><Avatar name={name} uri={uri} size={60} /></View>
          <View style={{ position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <Icon name="edit-2" size={12} color="#1668F0" />
          </View>
        </PressableScale>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="h3" tone="white" numberOfLines={1}>{name}</Text>
          {verified ? <Pill label={t("cpr.verifiedProfile")} tone="glass" icon="shield" small /> : null}
        </View>
      </View>
      {lexgoId ? (
        <PressableScale haptic={false} onPress={() => void copy(lexgoId)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" style={{ color: "rgba(255,255,255,0.75)" }}>{t("cpr.myId")}</Text>
            <Text variant="body" weight="bold" tone="white">{lexgoId}</Text>
          </View>
          <Icon name="copy" size={18} color="#FFFFFF" />
        </PressableScale>
      ) : null}
    </GradientBox>
  );
}
