import { View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useColors } from "@/shared/theme";
import { IconButton } from "../IconButton";
import { Text } from "../Text";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Streaming audio player for voice messages and recordings.
export function AudioView({ uri, title }: { uri: string; title?: string }) {
  const c = useColors();
  const player = useAudioPlayer({ uri });
  const st = useAudioPlayerStatus(player);
  const ratio = st.duration > 0 ? Math.min(1, st.currentTime / st.duration) : 0;
  return (
    <View style={{ padding: 24, gap: 16, alignItems: "center" }}>
      {title ? <Text variant="h4" center>{title}</Text> : null}
      <IconButton icon={st.playing ? "pause" : "play"} size={72} onPress={() => (st.playing ? player.pause() : player.play())} />
      <View style={{ height: 6, alignSelf: "stretch", borderRadius: 3, backgroundColor: c.tint2 }}>
        <View style={{ width: `${ratio * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
      </View>
      <Text tone="gray" variant="small">{mmss(st.currentTime)} / {mmss(st.duration)}</Text>
    </View>
  );
}
