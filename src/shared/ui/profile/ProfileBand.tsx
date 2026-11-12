import { Fragment, useState, type ReactNode } from "react";
import { Image, RefreshControl, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { interpolate, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ChevronRight, Pencil, Phone, type LucideIcon } from "lucide-react-native";
import { mainColor, radius, useTheme } from "@/shared/theme";
import { useInsets, HEADER_GAP, HEADER_ROW } from "@/shared/lib/insets";
import { formatAnyPhone } from "@/shared/lib/phone";
import { Avatar } from "../Avatar";
import { FocusStatusBar } from "../FocusStatusBar";
import { HeroScroll } from "../HeroScroll";
import { backIcon } from "../Icon";
import { IconButton } from "../IconButton";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

// The client's profile look, shared with a professional's profile pages: the blue band with the photo and name under a fixed bar, then
// white cards on the light ground — icon tiles in turn-taking soft colours, rows of one card under a small grey heading.

export const PROFILE_HOME_BG = "#F2F4F7"; // the light Home ground (widgets/client-dash HOME_BG)

const HEADER_COLORS = [mainColor, "#10499F"] as const;
const SHADOW_RIGHT = require("../../../../assets/shadow1.png");
const SHADOW_LEFT = require("../../../../assets/shadow2.png");
// The icon tiles' colours, handed out in order down the page. `fg: null` is the main colour, which the dark theme swaps for its lighter accent.
const TONES = [
  { bg: "#E6F0FF", fg: null },
  { bg: "#F0FDF4", fg: "#10B981" },
  { bg: "#FFF7ED", fg: "#F59E0B" },
  { bg: "#F5F3FF", fg: "#8B5CF6" },
  { bg: "#FEF2F2", fg: "#EF4444" },
  { bg: "#EFF6FF", fg: "#3B82F6" },
] as const;

const AVATAR = 64;
const SIDE = 16;
const NAME_LEFT = SIDE + AVATAR + 12; // the name's place in the band: after the avatar and its gap
const NAME_SIZE = 22;
const BAR_NAME_SIZE = 17;
const NAME_MOVE_MS = 260;
const BAR_NAME_DROP = 22; // how far below its place the bar's name starts

// The band's picture, also drawn in the fixed bar so that at rest the bar cannot be told from the band. `height`: the band's, so both match point for point.
function BandArt({ height }: { height?: number }) {
  return (
    <View pointerEvents="none" style={[s.art, height ? { height } : s.artFill]}>
      <LinearGradient colors={[...HEADER_COLORS]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image source={SHADOW_RIGHT} style={s.shadowRight} />
      <Image source={SHADOW_LEFT} style={s.shadowLeft} />
    </View>
  );
}

// An icon on its soft square tile; `order` picks the colour (the tiles take turns down the page).
export function ProfileIconTile({ icon: Glyph, order }: { icon: LucideIcon; order: number }) {
  const { colors: c, dark } = useTheme();
  const tone = TONES[order % TONES.length];
  return (
    <View style={[s.ico, { backgroundColor: dark ? c.surface2 : tone.bg }]}>
      <Glyph size={20} color={tone.fg ?? (dark ? c.accent : mainColor)} />
    </View>
  );
}

// A small grey heading over one white card.
export function ProfileGroup({ title, children, padded }: { title: string; children: ReactNode; padded?: boolean }) {
  const { colors: c } = useTheme();
  return (
    <View style={s.group}>
      <Text variant="caption" weight="bold" tone="gray" style={s.head}>{title}</Text>
      <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, padded ? s.cardPad : null]}>{children}</View>
    </View>
  );
}

export type ProfileRow = { key: string; icon: LucideIcon; title: string; sub?: string; badge?: number | string; warn?: boolean; onPress?: () => void };

// A heading and its rows in one card: tile, title (+ line), badge, chevron. `first`: the tile colour the first row takes.
export function ProfileList({ title, rows, first = 0 }: { title: string; rows: ProfileRow[]; first?: number }) {
  const { colors: c } = useTheme();
  return (
    <ProfileGroup title={title}>
      {rows.map((r, i) => {
        const body = (
          <>
            <ProfileIconTile icon={r.icon} order={first + i} />
            <View style={s.flex}>
              <Text variant="h4" weight="semibold" numberOfLines={1} style={s.title}>{r.title}</Text>
              {r.sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
            </View>
            {r.badge ? <View style={s.badge}><Text variant="caption" weight="bold" style={s.badgeTx}>{r.badge}</Text></View> : null}
            {r.warn ? <View style={[s.dot, { backgroundColor: c.warn }]} /> : null}
            {r.onPress ? <ChevronRight size={20} color={c.gray2} /> : null}
          </>
        );
        return (
          <Fragment key={r.key}>
            {r.onPress ? (
              <PressableScale onPress={r.onPress} scale={0.99} accessibilityRole="button" style={s.row}>{body}</PressableScale>
            ) : (
              <View style={s.row}>{body}</View>
            )}
            {i < rows.length - 1 ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
          </Fragment>
        );
      })}
    </ProfileGroup>
  );
}

type Props = {
  name: string;
  photo?: string;
  phone?: string;
  /** The grey line under the phone (LexGo ID, public ID). */
  line?: string;
  chips?: string[];
  onBack: () => void;
  onEdit?: () => void;
  editLabel?: string;
  /** Tapping the photo (a camera mark on it) — changing the photo. */
  onPhoto?: () => void;
  photoLabel?: string;
  /** More of the band, under the chips. */
  bandExtra?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
};

// The profile page: a fixed bar with the back button, under it the page that scrolls whole: the band (photo, name, phone · ID, chips, the pencil
// to edit), then the body. Once the name has gone half under the bar, the bar's own copy moves from the name's place to the middle; it goes back past
// a lower point. It runs on a timer, not with the scroll, so a finger's small moves do not shake it.
export function ProfileBandPage({ name, photo, phone, line, chips, onBack, onEdit, editLabel, onPhoto, photoLabel, bandExtra, refreshing, onRefresh, children }: Props) {
  const { width } = useWindowDimensions();
  const [bandH, setBandH] = useState<number>();
  const [whoY, setWhoY] = useState(0);
  const [colY, setColY] = useState(0);
  const [nameW, setNameW] = useState(0);
  const scrollY = useSharedValue(0);
  const past = useSharedValue(false);
  const inBar = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const barH = insets.top + HEADER_GAP + HEADER_ROW + 8;
  const on = whoY + colY - barH + NAME_SIZE / 2;
  const off = on - 12;
  // Until the band is measured (whoY is still 0) the threshold is meaningless (negative): the name stays in the band.
  const measured = whoY > 0;
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const now = measured && (past.value ? y > off : y > on);
      if (now === past.value) return;
      past.value = now;
      inBar.value = withTiming(now ? 1 : 0, { duration: NAME_MOVE_MS });
    },
    [measured, on, off],
  );
  const grow = NAME_SIZE / BAR_NAME_SIZE;
  const startX = NAME_LEFT + (nameW * grow) / 2 - width / 2;
  const barName = useAnimatedStyle(() => ({
    opacity: interpolate(inBar.value, [0, 0.35], [0, 1], "clamp"),
    transform: [
      { translateX: startX * (1 - inBar.value) },
      { translateY: BAR_NAME_DROP * (1 - inBar.value) },
      { scale: 1 + (grow - 1) * (1 - inBar.value) },
    ],
  }));
  const avatar = <Avatar name={name} uri={photo} size={AVATAR} square />;
  return (
    <View style={[s.fill, { backgroundColor: dark ? c.canvas : PROFILE_HOME_BG }]}>
      <FocusStatusBar style="light" />
      <HeroScroll
        capColor={mainColor}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" progressViewOffset={barH} /> : undefined}
      >
        <View onLayout={(e) => setBandH(e.nativeEvent.layout.height)} style={[s.band, { paddingTop: barH }]}>
          <BandArt />
          <View onLayout={(e) => setWhoY(e.nativeEvent.layout.y)} style={s.who}>
            {onPhoto ? (
              <PressableScale onPress={onPhoto} scale={0.96} accessibilityRole="button" accessibilityLabel={photoLabel}>
                {avatar}
                <View style={[s.cam, { borderColor: mainColor }]}><Camera size={12} color={mainColor} /></View>
              </PressableScale>
            ) : avatar}
            <View onLayout={(e) => setColY(e.nativeEvent.layout.y)} style={s.flex}>
              <Text variant="h3" tone="white" numberOfLines={2} style={s.name}>{name}</Text>
              {phone ? (
                <View style={s.phone}>
                  <Phone size={13} color="#FFFFFF" />
                  <Text variant="small" style={s.dim} numberOfLines={1}>{formatAnyPhone(phone)}</Text>
                </View>
              ) : null}
              {line ? <Text variant="caption" style={s.dim} numberOfLines={1}>{line}</Text> : null}
            </View>
            {onEdit ? (
              <PressableScale onPress={onEdit} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={editLabel} style={s.edit}>
                <Pencil size={17} color="#FFFFFF" />
              </PressableScale>
            ) : null}
          </View>
          {chips?.length ? (
            <View style={s.chips}>
              {chips.map((x) => <View key={x} style={s.chip}><Text variant="caption" weight="bold" tone="white">{x}</Text></View>)}
            </View>
          ) : null}
          {bandExtra}
        </View>
        {children}
      </HeroScroll>
      <View pointerEvents="box-none" style={[s.bar, { height: barH, paddingTop: insets.top + HEADER_GAP }]}>
        <BandArt height={bandH ?? barH} />
        <IconButton icon={backIcon} tone="glass" onPress={onBack} />
        <View pointerEvents="none" style={[s.barTitle, { top: insets.top + HEADER_GAP }]}>
          <Animated.View style={barName}>
            <Text variant="h3" tone="white" numberOfLines={1} onLayout={(e) => setNameW(e.nativeEvent.layout.width)} style={s.barName}>{name}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  band: { paddingHorizontal: SIDE, paddingBottom: 18, gap: 12, overflow: "hidden" },
  art: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden" },
  artFill: { bottom: 0 },
  bar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: SIDE, overflow: "hidden" },
  barTitle: { position: "absolute", left: SIDE + HEADER_ROW + 8, right: SIDE + HEADER_ROW + 8, height: HEADER_ROW, alignItems: "center", justifyContent: "center" },
  barName: { fontSize: BAR_NAME_SIZE, lineHeight: 22 },
  shadowRight: { position: "absolute", top: 0, right: 0, width: 180, height: 180 },
  shadowLeft: { position: "absolute", bottom: 0, left: 0, width: 100, height: 100 },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  cam: { position: "absolute", right: -4, bottom: -4, width: 24, height: 24, borderRadius: 12, borderWidth: 2, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  name: { fontSize: NAME_SIZE, lineHeight: 27 },
  phone: { flexDirection: "row", alignItems: "center", gap: 5 },
  dim: { color: "rgba(255,255,255,0.85)" },
  edit: { width: 34, height: 34, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(240,236,236,0.43)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(255,255,255,0.16)", borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  group: { gap: 8, paddingHorizontal: 16, marginTop: 20 },
  head: { letterSpacing: 1, marginLeft: 4 },
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  cardPad: { padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rule: { height: 1 },
  ico: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, lineHeight: 20 },
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#FDEBDD" },
  badgeTx: { color: "#A3471A" },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
