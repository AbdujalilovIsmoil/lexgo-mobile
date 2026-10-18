import { View } from "react-native";
import { useRouter } from "expo-router";
import { statusLabel } from "@/entities/payment";
import { useClientProfile } from "@/entities/profile-extras";
import { Pill, Text } from "@/shared/ui";
import { ACCENTS, ManageRow, ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// Web "Obuna" panel: plan name large + status pill, or the default "Standard · faol"; "Boshqarish" opens the plans page.
export function SubscriptionPanel() {
  const { t } = useT();
  const p = useClientProfile().data;
  const router = useRouter();
  const [gold] = ACCENTS.gold;
  return (
    <ProfileSection accent="gold" icon="star" title={t("cpr.subscription")} action={{ icon: "settings", label: t("ntd.pfManage"), onPress: () => router.push("/subscription") }}>
      <View style={{ gap: 8, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: `${gold}55`, backgroundColor: `${gold}18` }}>
        <Text variant="h2" numberOfLines={2}>{p?.planName || t("cpr.subActive")}</Text>
        {p?.planName && p.planStatus ? <Pill label={statusLabel(p.planStatus, t)} tone={p.planStatus === "active" ? "ok" : "gray"} icon="award" small /> : null}
      </View>
      <ManageRow accent="gold" icon="settings" label={t("ntd.pfManage")} sub={t("ntd.pfManageSub")} onPress={() => router.push("/subscription")} />
    </ProfileSection>
  );
}
