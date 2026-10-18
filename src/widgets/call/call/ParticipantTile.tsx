import { StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { Track } from "livekit-client";
import { VideoTrack } from "@/features/call/call";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import type { Tile } from "./tiles";

type Props = { tile: Tile; width: number; height: number; mirror: boolean; onPress?: () => void };

// One person in the call: their video (or an avatar when the camera is off), name, mic state and a
// glowing border while speaking. A shared screen is shown whole (contain), a camera fills the tile.
export function ParticipantTile({ tile, width, height, mirror, onPress }: Props) {
  const { t } = useT();
  const c = useColors();
  const ref = tile.pub ? { participant: tile.p, publication: tile.pub, source: tile.share ? Track.Source.ScreenShare : Track.Source.Camera } : undefined;
  return (
    <PressableScale onPress={onPress} scale={0.99} haptic={false} style={[s.tile, { width, height, backgroundColor: "#0B1730", borderColor: tile.speaking ? c.ok : "transparent" }]}>
      {ref ? (
        <VideoTrack trackRef={ref} style={{ width: "100%", height: "100%" }} objectFit={tile.share ? "contain" : "cover"} mirror={mirror && tile.local && !tile.share} />
      ) : (
        <View style={s.avatar}>
          <Avatar name={tile.name} size={Math.min(84, Math.round(Math.min(width, height) * 0.45))} />
          <Text variant="caption" style={s.off}>{t("admMeet.camOff")}</Text>
        </View>
      )}
      <View style={s.label}>
        {tile.mic ? null : <Icon name="mic-off" size={12} color="#FF9494" />}
        <Text variant="caption" weight="semibold" tone="white" numberOfLines={1} style={s.name}>{tile.name}{tile.local ? ` (${t("admMeetB.you")})` : ""}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  tile: { borderRadius: 16, overflow: "hidden", borderWidth: 3, alignItems: "center", justifyContent: "center" },
  avatar: { alignItems: "center", gap: 8 },
  off: { color: "#8494AB" },
  label: { position: "absolute", left: 8, bottom: 8, maxWidth: "88%", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(3,16,43,0.62)", borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  name: { flexShrink: 1 },
});
