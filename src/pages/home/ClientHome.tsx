import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { scheduleOnRN } from "react-native-worklets";
import { useAiFabAway } from "@/shared/lib/aiFabAway";
import { View } from "react-native";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { HeroScroll, TabletColumn } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useColors, useTheme } from "@/shared/theme";
import { useIsAuthed } from "@/entities/session";
import {
  DashAsk,
  DashBackdrop,
  DashGuest,
  DashHero,
  DashReferral,
  DashRequests,
  DashServices,
  DashTopBar,
  HOME_BG,
} from "@/widgets/client-dash";

// Client dashboard in the Adliya look: the fixed top bar over the navy band (menu, name, support, bell, avatar), the quick chips inside the
// band → the ask field → "Xizmatlar" (the wide document-analysis card, then the ways in two by two) → "Faol ishlar" (cards that scroll
// sideways) → referral progress. Everything but the top bar scrolls together.
export function ClientHome() {
  const c = useColors();
  const insets = useInsets();
  const authed = useIsAuthed();
  const { dark } = useTheme();
  const [bandEnd, setBandEnd] = useState<number>();
  const [barH, setBarH] = useState<number>();
  const top = barH ?? insets.top + HEADER_GAP + BAR_ROW_GUESS;
  const end = bandEnd ?? top + CHIPS_GUESS;
  const scrollY = useSharedValue(0);
  // The floating AI button leaves while the page goes down and comes back on a small move up (or at the top). `mark` is where the current
  // run of one direction started, so the small jitters of a finger do not flip it.
  const setAway = useAiFabAway((x) => x.set);
  const mark = useSharedValue(0);
  const away = useSharedValue(false);
  const onScroll = useAnimatedScrollHandler((e) => {
    const y = e.contentOffset.y;
    scrollY.value = y;
    let next = away.value;
    if (y <= TOP_ZONE) next = false;
    else if (y - mark.value > HIDE_AFTER) next = true;
    else if (mark.value - y > SHOW_AFTER) next = false;
    if ((away.value ? y > mark.value : y < mark.value) || next !== away.value) mark.value = y; // follow the run that keeps the state
    if (next !== away.value) {
      away.value = next;
      scheduleOnRN(setAway, next);
    }
  });
  // Leaving Home (another tab, a pushed page) brings the button back, so it is never left away elsewhere.
  useFocusEffect(useCallback(() => {
    away.set(false);
    mark.set(scrollY.get());
    return () => setAway(false);
  }, [setAway, away, mark, scrollY]));
  return (
    <View style={{ flex: 1, backgroundColor: dark ? c.canvas : HOME_BG }}>
      <DashBackdrop end={end} scrollY={scrollY} />
      <HeroScroll
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        capColor="transparent"
      >
        {/* The band ends where the hero ends (the content starts at the top of the screen, as the backdrop does). */}
        <DashHero top={top} onLayout={(e) => setBandEnd(e.nativeEvent.layout.y + e.nativeEvent.layout.height)} />
        <TabletColumn>
          <DashAsk />
          <DashServices />
          {authed ? (
            <>
              <DashRequests />
              <DashReferral />
            </>
          ) : (
            <>
              <View style={{ height: 16 }} />
              <DashGuest />
            </>
          )}
        </TabletColumn>
      </HeroScroll>
      <DashTopBar end={end} scrollY={scrollY} onLayout={(e) => setBarH(e.nativeEvent.layout.height)} />
    </View>
  );
}

const TOP_ZONE = 40; // near the top the button always shows
const HIDE_AFTER = 12; // points scrolled down before it leaves
const SHOW_AFTER = 18; // points scrolled up before it comes back ("birozgina")
const BAR_ROW_GUESS = 52; // the fixed bar's row and padding, until the measure arrives
const CHIPS_GUESS = 48; // the chips row and the band's bottom padding, until the measure arrives
