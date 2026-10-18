import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";

type BtnProps = { icon: IconName; label: string; onPress: () => void; off?: boolean; on?: boolean; danger?: boolean; disabled?: boolean; badge?: number };
function Btn({ icon, label, onPress, off, on, danger, disabled, badge }: BtnProps) {
  const bg = danger ? "#E5484D" : off ? "#FFFFFF" : on ? "#1668F0" : "rgba(255,255,255,0.16)";
  return (
    <PressableScale onPress={disabled ? undefined : onPress} style={[s.item, disabled && { opacity: 0.45 }]} accessibilityLabel={label}>
      <View style={[s.btn, { backgroundColor: bg }]}>
        <Icon name={icon} size={22} color={off ? "#0A1526" : "#FFFFFF"} />
        {badge ? <View style={s.badge}><Text variant="caption" weight="bold" tone="white" style={s.n}>{badge > 9 ? "9+" : badge}</Text></View> : null}
      </View>
      <Text variant="caption" style={s.label} numberOfLines={1}>{label}</Text>
    </PressableScale>
  );
}

type Props = { mic: boolean; cam: boolean; showCam: boolean; camLabel: string; showFlip: boolean; speaker: boolean; unread: number; busy: boolean; locked: boolean; labels: Record<"mic" | "cam" | "flip" | "speaker" | "more" | "end", string>;
  onMic: () => void; onCam: () => void; onFlip: () => void; onSpeaker: () => void; onMore: () => void; onEnd: () => void };

// Bottom control bar: mic, camera (or "switch to video" on an audio call), lens flip, speaker, more, hang up.
export function CallControls(p: Props) {
  const insets = useInsets();
  return (
    <View style={[s.bar, { paddingBottom: insets.bottom + 10 }]}>
      <Btn icon={p.mic ? "mic" : "mic-off"} label={p.labels.mic} off={!p.mic} onPress={p.onMic} disabled={p.locked && !p.mic} />
      {p.showCam ? <Btn icon={p.cam ? "video" : "video-off"} label={p.camLabel} off={!p.cam} onPress={p.onCam} disabled={p.busy} /> : null}
      {p.showFlip ? <Btn icon="refresh-cw" label={p.labels.flip} onPress={p.onFlip} disabled={p.busy} /> : null}
      <Btn icon={p.speaker ? "volume-2" : "volume-x"} label={p.labels.speaker} on={p.speaker} onPress={p.onSpeaker} />
      <Btn icon="more-horizontal" label={p.labels.more} onPress={p.onMore} badge={p.unread} />
      <Btn icon="phone-off" label={p.labels.end} danger onPress={p.onEnd} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start", paddingHorizontal: 8, paddingTop: 10, backgroundColor: "rgba(3,16,43,0.85)" },
  item: { alignItems: "center", gap: 5, flex: 1 },
  btn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  label: { color: "#C9D6EA", fontSize: 11 },
  badge: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#E5484D", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  n: { fontSize: 11, lineHeight: 14 },
});
