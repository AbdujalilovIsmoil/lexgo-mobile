import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useInsets } from "@/shared/lib/insets";
import type { User } from "@/entities/session";
import { Button, GradientBox, Text, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { ProfileCover } from "./ProfileCover";
import { ProfileIdentity } from "./ProfileIdentity";

// Signed-in: a cover band with the avatar overlapping its edge, then name, phone and chips. Guest: welcome + login/register.
export function ProfileHeader({ user, photo }: { user: User | null; photo?: string }) {
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const a = useAccess();
  const roleKey = a.isSuper ? "nav2.role.superadmin" : a.isFullAdmin || (a.staff && !a.seller && !a.callCenterOperator) ? "nav2.role.staff" : a.callCenterOperator ? "nav2.role.callCenter" : a.orgOwner ? "nav2.role.orgOwner" : user?.role === "advocate" ? "profile.roleAdvocate" : user?.role === "lawyer" ? "profile.roleLawyer" : "profile.roleClient";
  if (user) return <View><ProfileCover /><ProfileIdentity user={user} photo={photo} role={roleKey} /></View>;
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + 20 }]}>
      <FocusStatusBar style="light" />
      <View style={s.guest}>
        <Text variant="h2" tone="white">
          {t("profile.guestTitle")}
        </Text>
        <Text variant="small" style={s.phone}>
          {t("profile.guestSub")}
        </Text>
        <View style={s.row}>
          <Button title={t("profile.login")} onPress={() => router.push("/auth/login")} variant="gradient" icon="log-in" style={s.half} />
          <Button title={t("profile.register")} onPress={() => router.push("/auth/register")} variant="glass" style={s.half} />
        </View>
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  guest: { gap: 8 },
  phone: { color: "#C4DEFF" },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  half: { flex: 1 },
});
