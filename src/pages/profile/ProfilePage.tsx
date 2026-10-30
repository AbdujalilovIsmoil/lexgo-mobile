import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useSession } from "@/entities/session";
import { AppSettings, ProfileHeader, ProfileMenu } from "@/widgets/profile";
import { IdentityCard } from "@/widgets/identity";
import { ProfileExtrasMenu, ProfileSummary } from "@/widgets/profile-extras";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GuestWelcome } from "@/widgets/guest-welcome";
import { HeroScroll, IconButton, backIcon } from "@/shared/ui";
import { useRaPage } from "@/shared/remote-assist";
import { ClientProfile } from "./ClientProfile";

// /profile, a stack page with no tab bar: signed-in users get their profile; visitors get the welcome / sign-in page. The back button is in
// the client's title row; the others' pages start with a dark band, so theirs floats over it.
export function ProfilePage() {
  const router = useRouter();
  const c = useColors();
  const insets = useInsets();
  const session = useSession();
  const role = useTabRole();
  const client = role === "client";
  const seller = role === "seller"; // a professional's links live in the sidebar
  useRaPage(client ? "client.profile" : ""); // remote assistance: the client profile (its sections open on their own pages)
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const floating = <View style={[s.back, { top: insets.top + HEADER_GAP }]}><IconButton icon={backIcon} tone="glass" onPress={back} /></View>;
  if (!session) return <View style={s.fill}><GuestWelcome />{floating}</View>;
  return (
    <View style={s.fill}>
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      {client ? <ClientProfile user={session.user} onBack={back} /> : <ProfileHeader user={session.user} />}
      {client ? null : (
        <>
          <ProfileSummary />
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}><IdentityCard /></View>
        </>
      )}
      {client || seller ? null : <ProfileMenu />}
      {client || seller ? null : <ProfileExtrasMenu />}
      <AppSettings />
    </HeroScroll>
    {client ? null : floating}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  back: { position: "absolute", left: 16 },
});
