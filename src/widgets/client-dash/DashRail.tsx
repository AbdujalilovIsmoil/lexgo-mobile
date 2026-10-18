import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { DASH_ACTIONS } from "./actionsData";
import { RailCard, RAIL_CARD } from "./RailCard";
import { WhoSheet } from "./WhoSheet";

const GAP = 12;

// The six quick actions (portal/client/page.tsx QUICK_ACTIONS, same order and contents) as a rail inside the hero:
// swipe sideways, cards snap; "describe" first asks who should answer (advocate or AI).
export function DashRail() {
  const router = useRouter();
  const [who, setWho] = useState(false);
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={RAIL_CARD + GAP} snapToAlignment="start" style={s.rail} contentContainerStyle={s.row}>
        {DASH_ACTIONS.map((a) => <RailCard key={a.key} a={a} onPress={() => (a.href ? router.navigate(a.href as never) : setWho(true))} />)}
      </ScrollView>
      <WhoSheet visible={who} onClose={() => setWho(false)} />
    </>
  );
}

const s = StyleSheet.create({
  rail: { marginHorizontal: -16, marginTop: 10 },
  row: { gap: GAP, paddingHorizontal: 16 },
});
