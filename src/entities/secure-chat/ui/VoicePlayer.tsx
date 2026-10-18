import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { mmss } from "@/shared/lib/format";

const BARS = 30;
const RATES = [1, 1.5, 2];
const seeded = (seed: string, i: number) => 0.28 + 0.72 * Math.abs(Math.sin(i * 12.9898 + [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0) * 0.37));

// A voice note: play / pause, a waveform that doubles as the seek bar, the clock and a speed switch.
export function VoicePlayer({ uri, seed, fg }: { uri: string; seed: string; fg: string }) {
  const player = useAudioPlayer({ uri });
  const st = useAudioPlayerStatus(player);
  const [rate, setRate] = useState(0);
  const [w, setW] = useState(0);
  const ratio = st.duration > 0 ? Math.min(1, st.currentTime / st.duration) : 0;
  const toggle = () => {
    if (st.playing) return player.pause();
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
    if (st.duration > 0 && st.currentTime >= st.duration - 0.1) void player.seekTo(0);
    player.setPlaybackRate(RATES[rate]);
    player.play();
  };
  const cycle = () => {
    const next = (rate + 1) % RATES.length;
    setRate(next);
    player.setPlaybackRate(RATES[next]);
  };
  return (
    <View style={s.row}>
      <PressableScale onPress={toggle} style={[s.play, { backgroundColor: fg + "26" }]}>
        {st.isBuffering && !st.isLoaded ? <ActivityIndicator color={fg} /> : <Icon name={st.playing ? "pause" : "play"} size={20} color={fg} />}
      </PressableScale>
      <View style={s.wave} onLayout={(e) => setW(e.nativeEvent.layout.width)} onTouchEnd={(e) => w > 0 && st.duration > 0 && void player.seekTo((e.nativeEvent.locationX / w) * st.duration)}>
        {Array.from({ length: BARS }, (_, i) => <View key={i} pointerEvents="none" style={[s.bar, { height: 4 + seeded(seed, i) * 22, backgroundColor: fg, opacity: (i + 0.5) / BARS <= ratio ? 1 : 0.35 }]} />)}
      </View>
      <View style={s.side}>
        <Text variant="caption" style={{ color: fg }}>{mmss(((st.playing || ratio > 0 ? st.currentTime : st.duration) || 0) * 1000)}</Text>
        <PressableScale onPress={cycle} haptic={false}><Text variant="caption" weight="bold" style={{ color: fg, opacity: 0.8 }}>{RATES[rate]}x</Text></PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 220 },
  play: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  wave: { flex: 1, height: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bar: { width: 3, borderRadius: 2 },
  side: { alignItems: "flex-end", minWidth: 36 },
});
