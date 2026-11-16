import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Award, BriefcaseBusiness, type LucideIcon } from "lucide-react-native";
import { useMyProfile } from "@/entities/pro-profile";
import { PressableScale, Text } from "@/shared/ui";
import { ProfileIconTile } from "@/shared/ui/profile";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// A professional's licence number and years of experience on "Shaxsiy ma'lumotlarim" (they left the profile band): one white card, two rows —
// the soft blue tile, the label, the value. A tap opens the professional profile where they are edited. Mounted for professionals only.
export function SellerFacts() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const pro = useMyProfile().data;
  const rows: { key: string; icon: LucideIcon; label: string; value: string }[] = [
    { key: "license", icon: Award, label: t("profile.pp.seller.license"), value: pro?.licenseNumber ? `№ ${pro.licenseNumber}` : t("cpr.notSet") },
    { key: "exp", icon: BriefcaseBusiness, label: t("mkd.hero.exp"), value: pro?.experienceYears ? t("mkd.hero.years", { n: pro.experienceYears }) : t("cpr.notSet") },
  ];
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      {rows.map((r, i) => (
        <PressableScale key={r.key} onPress={() => router.push("/pro/profile" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${r.label}: ${r.value}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: line }]}>
          <ProfileIconTile icon={r.icon} />
          <View style={s.txt}>
            <Text variant="small" tone="gray">{r.label}</Text>
            <Text variant="body" weight="bold" numberOfLines={1}>{r.value}</Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  txt: { flex: 1, minWidth: 0, gap: 2 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
