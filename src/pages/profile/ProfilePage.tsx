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
// import { MenuButton } from "@/widgets/client-sidebar/MenuButton"; // the drawer is off on the Profil tab: its rows are in the profile now
import { useTabClearance } from "@/widgets/tab-page";
import { ClientProfile } from "./ClientProfile";
import { SellerProfile } from "./SellerProfile";

// /profile, a stack page with no tab bar: signed-in users get their profile; visitors get the welcome / sign-in page. The client and the
// professional pages carry the back button in their own bar; the others' pages start with a dark band, so theirs floats over it.
// `tab`: the client's Profil tab — no back button (and no drawer button: the drawer's rows are in the profile), room at the bottom for the tab bar.
export function ProfilePage({ tab }: { tab?: boolean } = {}) {
  const router = useRouter();
  const c = useColors();
  const insets = useInsets();
  const session = useSession();
  const role = useTabRole();
  const client = role === "client";
  const seller = role === "seller"; // a professional's links live in the sidebar
  useRaPage(client ? "client.profile" : ""); // remote assistance: the client profile (its sections open on their own pages)
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const clearance = useTabClearance(24);
  const floating = <View style={[s.back, { top: insets.top + HEADER_GAP }]}><IconButton icon={backIcon} tone="glass" onPress={back} /></View>;
  if (!session) return <View style={s.fill}><GuestWelcome />{floating}</View>;
  if (client) return tab ? <ClientProfile user={session.user} bottomPad={clearance} aiFab /> : <ClientProfile user={session.user} onBack={back} />;
  if (seller) return <SellerProfile user={session.user} onBack={back} />;
  return (
    <View style={s.fill}>
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <ProfileHeader user={session.user} />
      <ProfileSummary />
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}><IdentityCard /></View>
      <ProfileMenu />
      <ProfileExtrasMenu />
      <AppSettings />
    </HeroScroll>
    {floating}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  back: { position: "absolute", left: 16 },
});

// The Profil tab (app/(tabs)/me): a client's profile; anyone else who lands here (a visitor signs in first) gets the plain page.
export function ProfileTab() {
  return <ProfilePage tab />;
}
