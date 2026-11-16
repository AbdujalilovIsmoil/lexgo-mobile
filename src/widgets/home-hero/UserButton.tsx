import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { displayName, useSession } from "@/entities/session";
import { useClientProfile } from "@/entities/profile-extras";
import { Avatar, PressableScale } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const SIZE = 40;

// Home's top left corner (in place of the menu button, for now): the user's photo — or their initials — as a small rounded square the size of
// the header buttons. A tap opens Profil; a visitor gets the person mark and the sign-in.
export function UserButton({ onWhite }: { onWhite?: boolean }) {
  const router = useRouter();
  const { t } = useT();
  const session = useSession();
  const photo = useClientProfile().data?.avatarUrl;
  const name = displayName(session?.user) || session?.user.phone || "";
  const ring = onWhite ? { borderColor: "#E6EBF3" } : { borderColor: "rgba(255,255,255,0.35)" };
  if (!session) {
    return (
      <PressableScale onPress={() => router.push("/auth/login")} scale={0.94} hitSlop={6} accessibilityRole="button" accessibilityLabel={t("tabs.profile")} style={[s.box, ring, onWhite ? s.light : s.glass]}>
        <User size={19} color={onWhite ? "#0B1A33" : "#FFFFFF"} />
      </PressableScale>
    );
  }
  return (
    <PressableScale onPress={() => router.navigate("/(tabs)/me")} scale={0.94} hitSlop={6} accessibilityRole="button" accessibilityLabel={t("tabs.profile")} style={[s.box, ring]}>
      <Avatar name={name} uri={photo} size={SIZE - 3} square />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  box: { width: SIZE, height: SIZE, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glass: { backgroundColor: "rgba(255,255,255,0.14)" },
  light: { backgroundColor: "#FFFFFF" },
});
