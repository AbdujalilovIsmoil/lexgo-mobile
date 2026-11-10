import { useState } from "react";
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
  DashQuick,
  DashReferral,
  DashRequests,
  DashTiles,
  DashTopBar,
  HOME_BG,
} from "@/widgets/client-dash";

// Client dashboard (no header banner here, unlike the other tabs): the fixed top bar, then the dark hero (the question) with the ask field on its bottom edge → the four ways in (2×2) →
// urgent advocate | car accident, SOS → active requests → referral progress. Everything but the top bar scrolls together.
export function ClientHome() {
  const c = useColors();
  const insets = useInsets();
  const authed = useIsAuthed();
  const { dark } = useTheme();
  const [fadeEnd, setFadeEnd] = useState<number>();
  const [barH, setBarH] = useState<number>();
  const end = fadeEnd ?? insets.top + FADE_END_GUESS;
  const top = barH ?? insets.top + HEADER_GAP + BAR_ROW_GUESS;
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
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
        <DashHero top={top} />
        <DashAsk />
        {/* Where the ask field ends; the tiles start TILES_GAP below it — the backdrop fades out a little below that. */}
        <View
          onLayout={(e) =>
            setFadeEnd(e.nativeEvent.layout.y + TILES_GAP + FADE_INTO_TILES)
          }
        />
        <TabletColumn>
          <DashTiles />
          <DashQuick />
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

const FADE_END_GUESS = 230; // below the status bar, until the measure arrives
const BAR_ROW_GUESS = 52; // the fixed bar's row and padding, until the measure arrives
const TILES_GAP = 16; // DashTiles grid marginTop
const FADE_INTO_TILES = 40; // the fade runs a little way behind the first tiles row, so it ends softer
