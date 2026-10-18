import { View } from "react-native";
import type { JournalEntry } from "@/entities/security";
import { kindIcon } from "@/entities/security";
import { fmtTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Icon, PressableScale, Pill, Text } from "@/shared/ui";
import { entrySubtitle, entryTitle } from "./journalText";
import { useToneColors } from "./kindStyle";

// One event on the day's timeline: a round kind tile on the rail, bold title, one-line subtitle, the time on the
// right and a red chip when it failed or looked suspicious. Tap opens the details sheet.
export function JournalRow({ entry, last, onPress }: { entry: JournalEntry; last: boolean; onPress: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const tone = useToneColors()(entry.kind, entry.failed);
  const title = entryTitle(entry, t, locale);
  const sub = entrySubtitle(entry);
  const time = fmtTime(entry.createdAt);
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.985} accessibilityRole="button" accessibilityLabel={[title, time, sub].filter(Boolean).join(", ")} style={{ flexDirection: "row", gap: 12, minHeight: 56 }}>
      <View style={{ width: 40, alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tone.bg, alignItems: "center", justifyContent: "center" }}>
          <Icon name={kindIcon(entry.kind)} size={18} color={tone.fg} />
        </View>
        {last ? null : <View style={{ flex: 1, width: 2, marginTop: 4, borderRadius: 1, backgroundColor: c.line }} />}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : 16, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text variant="body" weight="bold" numberOfLines={1} style={{ flex: 1 }}>{title}</Text>
          <Text variant="caption" tone="gray">{time}</Text>
        </View>
        {sub ? <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text> : null}
        {entry.failed ? <View style={{ flexDirection: "row", marginTop: 4 }}><Pill small tone="err" label={t(entry.source === "event" ? "secUx.suspicious" : "secUx.failed")} /></View> : null}
      </View>
    </PressableScale>
  );
}
