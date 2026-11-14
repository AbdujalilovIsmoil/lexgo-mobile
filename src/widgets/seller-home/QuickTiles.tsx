import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CalendarDays, FolderPlus, Upload, UserPlus, Zap, type LucideIcon } from "lucide-react-native";
import { CaseFormSheet } from "@/features/pro-case-form";
import { EventFormSheet } from "@/features/pro-event-form";
import { todayKey } from "@/shared/lib/pro/dates";
import { radius, useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SectionHead } from "./SectionHead";

type Sheet = "case" | "event" | null;
type Tile = { key: string; icon: LucideIcon; fg: string; bg: [string, string]; on: () => void; primary?: boolean };

// "Tezkor amallar": four tall tiles in a row — new client (solid blue, the main one), new case (lilac), upload a document (mint) and set a
// meeting (peach), each a soft gradient with its Lucide glyph over a two-line label. New case and the meeting open their form in place; a
// new client opens its own page; the upload goes to Files.
export function QuickTiles() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const [open, setOpen] = useState<Sheet>(null);
  const tiles: Tile[] = [
    { key: "quickClient", icon: UserPlus, fg: "#FFFFFF", bg: ["#1D5FE0", "#0B3FB0"], on: () => router.push("/pro/clients/new" as never), primary: true },
    { key: "quickCase", icon: FolderPlus, fg: "#7A5CFF", bg: ["#F4F1FF", "#E9E3FF"], on: () => setOpen("case") },
    { key: "quickDoc", icon: Upload, fg: "#0E9F6E", bg: ["#EEFBF5", "#D9F5E8"], on: () => router.push("/pro/files" as never) },
    { key: "quickMeeting", icon: CalendarDays, fg: "#E8662E", bg: ["#FFF6EE", "#FFE7D4"], on: () => setOpen("event") },
  ];
  return (
    <View style={s.col}>
      <SectionHead icon={Zap} title={t("shm.dash.quickActions")} />
      <View style={s.row}>
        {tiles.map(({ key, icon: Glyph, fg, bg, on, primary }) => (
          <PressableScale key={key} onPress={on} scale={0.95} accessibilityRole="button" accessibilityLabel={t(`shm.dash.${key}`)} style={s.cell}>
            <LinearGradient
              colors={dark && !primary ? [c.surface2, c.surface2] : bg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.tile, { borderColor: primary ? "transparent" : dark ? c.line : "rgba(255,255,255,0.9)" }]}
            >
              <Glyph size={28} color={fg} strokeWidth={1.9} />
              <Text variant="small" weight="semibold" center numberOfLines={2} maxFontSizeMultiplier={1.1} style={primary ? s.white : undefined}>{t(`shm.dash.${key}`)}</Text>
            </LinearGradient>
          </PressableScale>
        ))}
      </View>
      <CaseFormSheet visible={open === "case"} onClose={() => setOpen(null)} item={null} />
      <EventFormSheet visible={open === "event"} onClose={() => setOpen(null)} event={null} day={todayKey()} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1 },
  tile: { height: 124, borderRadius: radius.rl, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 6 },
  white: { color: "#FFFFFF" },
});
