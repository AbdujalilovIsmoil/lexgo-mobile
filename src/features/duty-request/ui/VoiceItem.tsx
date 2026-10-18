import { StyleSheet, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { IconButton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// A recorded voice note with inline play/pause and its length.
export function VoiceItem({ uri, label, onRemove }: { uri: string; label: string; onRemove: () => void }) {
  const c = useColors();
  const player = useAudioPlayer({ uri });
  const st = useAudioPlayerStatus(player);
  const ratio = st.duration > 0 ? Math.min(1, st.currentTime / st.duration) : 0;
  return (
    <View style={[s.row, { backgroundColor: c.surface2 }]}>
      <IconButton icon={st.playing ? "pause" : "play"} size={36} onPress={() => {
        if (st.playing) return player.pause();
        if (ratio >= 0.99) void player.seekTo(0);
        player.play();
      }} label={label} />
      <View style={s.mid}>
        <Text variant="small" weight="semibold" numberOfLines={1}>{label}</Text>
        <View style={[s.bar, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${ratio * 100}%`, backgroundColor: c.accent }]} /></View>
      </View>
      <Text variant="caption" tone="gray">{mmss(st.duration || 0)}</Text>
      <IconButton icon="x" size={32} onPress={onRemove} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 8, borderRadius: 16 },
  mid: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
