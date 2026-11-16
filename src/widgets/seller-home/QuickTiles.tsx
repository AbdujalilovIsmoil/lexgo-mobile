import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CalendarDays, FolderPlus, ListPlus, Upload, type LucideIcon } from "lucide-react-native";
import { CaseFormSheet } from "@/features/pro-case-form";
import { EventFormSheet } from "@/features/pro-event-form";
import { todayKey } from "@/shared/lib/pro/dates";
import { useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Sheet = "case" | "event" | null;
type Tile = { key: string; icon: LucideIcon; fg: string; bg: [string, string]; on: () => void; primary?: boolean };

// "Tezkor amallar" right under the header: four rounded squares in one row — add a task (solid blue, the main one; opens the tasks page), new case (lilac), upload a
// document (mint) and set a meeting (peach) — each with its Lucide glyph and the two-line label inside the square. New case and the meeting open their form in place; a
// new client opens its own page; the upload goes to Files.
export function QuickTiles() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const [open, setOpen] = useState<Sheet>(null);
  const tiles: Tile[] = [
    // { key: "quickClient", icon: UserPlus, fg: "#FFFFFF", bg: ["#1D5FE0", "#0B3FB0"], on: () => router.push("/pro/clients/new" as never), primary: true },
    { key: "quickTask", icon: ListPlus, fg: "#FFFFFF", bg: ["#1D5FE0", "#0B3FB0"], on: () => router.push("/pro/tasks" as never), primary: true },
    { key: "quickCase", icon: FolderPlus, fg: "#7A5CFF", bg: ["#F4F1FF", "#E9E3FF"], on: () => setOpen("case") },
    { key: "quickDoc", icon: Upload, fg: "#0E9F6E", bg: ["#EEFBF5", "#D9F5E8"], on: () => router.push("/pro/files" as never) },
    { key: "quickMeeting", icon: CalendarDays, fg: "#E8662E", bg: ["#FFF6EE", "#FFE7D4"], on: () => setOpen("event") },
  ];
  return (
    <View style={s.row}>
      {tiles.map(({ key, icon: Glyph, fg, bg, on, primary }) => (
        <PressableScale key={key} onPress={on} scale={0.95} accessibilityRole="button" accessibilityLabel={t(`shm.dash.${key}`)} style={s.cell}>
          <LinearGradient colors={dark && !primary ? [c.surface2, c.surface2] : bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, primary && s.lift]}>
            <Glyph size={26} color={fg} strokeWidth={1.9} />
            <Text variant="caption" weight="semibold" center numberOfLines={2} maxFontSizeMultiplier={1.1} style={[s.label, { color: primary ? "#FFFFFF" : c.ink }]}>{t(`shm.dash.${key}`)}</Text>
          </LinearGradient>
        </PressableScale>
      ))}
      <CaseFormSheet visible={open === "case"} onClose={() => setOpen(null)} item={null} />
      <EventFormSheet visible={open === "event"} onClose={() => setOpen(null)} event={null} day={todayKey()} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1 },
  tile: { height: 104, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 4 },
  lift: Platform.select({ ios: { shadowColor: "#1D4ED8", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 4 } })!,
  label: { fontSize: 12, lineHeight: 15 },
});
