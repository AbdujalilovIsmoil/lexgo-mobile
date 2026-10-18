import { StyleSheet, View } from "react-native";
import { HeroScroll } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { Benefits } from "./Benefits";
import { GuestActions } from "./GuestActions";
import { GuestHero } from "./GuestHero";
import { GuestSettings } from "./GuestSettings";

// The "Sign in" tab for visitors: orb header, benefits, actions, app settings.
export function GuestWelcome() {
  const c = useColors();
  const insets = useInsets();
  return (
    <HeroScroll style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}>
      <GuestHero />
      <View style={s.body}>
        <Benefits />
        <GuestActions />
      </View>
      <GuestSettings />
    </HeroScroll>
  );
}

const s = StyleSheet.create({
  body: { marginTop: 24, gap: 20, marginBottom: 4 },
});
