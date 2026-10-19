import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "@/shared/ui";
import type { RoomStatus } from "@/features/call/call";
import { mmss } from "@/shared/lib/format";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import type { StageMode } from "./CallStage";

type Props = { rec?: boolean; title: string; status: RoomStatus; elapsed: number; left: number | null; paused: boolean; count: number; mode: StageMode; video: boolean; onMode: () => void; onPeople: () => void };
const DOT: Record<RoomStatus, string> = { live: "#22C55E", ringing: "#F59E0B", connecting: "#F59E0B", reconnecting: "#F59E0B", ended: "#EF4444", error: "#EF4444" };

// Top bar of the call: title, connection state, elapsed time and the time left, people count, layout switch.
export function CallHeader({ rec, title, status, elapsed, left, paused, count, mode, video, onMode, onPeople }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const low = left != null && left <= 120 && !paused;
  return (
    <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
      <View style={s.col}>
        <View style={s.row}><Text variant="h4" tone="white" numberOfLines={1} style={s.col}>{title || t("admMeet.meeting")}</Text>{rec ? <Text variant="caption" weight="bold" style={s.rec}>● REC</Text> : null}</View>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: DOT[status] }]} />
          <Text variant="caption" style={s.sub}>{t(`admMeetB.status.${status}`)} · {mmss(elapsed * 1000)}</Text>
          {left != null ? <Text variant="caption" weight="bold" style={{ color: paused ? "#F59E0B" : low ? "#FF9494" : "#9CC3FF" }}>{paused ? t("admMeetB.paused") : `${t("admMeetB.left")} ${mmss(left * 1000)}`}</Text> : null}
        </View>
      </View>
      {video ? <IconButton icon={mode === "grid" ? "user" : "grid"} tone="glass" size={42} onPress={onMode} label={t("admMeetB.layout")} /> : null}
      <View>
        <IconButton icon="users" tone="glass" size={42} onPress={onPeople} label={t("admMeetB.people")} />
        <View style={s.badge}><Text variant="caption" weight="bold" tone="white" style={s.n}>{count}</Text></View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  col: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  rec: { color: "#FF6B6B" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sub: { color: "#A5B4C8" },
  badge: { position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  n: { fontSize: 11, lineHeight: 14 },
});
