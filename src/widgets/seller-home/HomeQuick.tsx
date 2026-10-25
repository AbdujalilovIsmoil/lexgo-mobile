import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CaseFormSheet } from "@/features/pro-case-form";
import { ClientFormSheet } from "@/features/pro-client-form";
import { EventFormSheet } from "@/features/pro-event-form";
import { todayKey } from "@/shared/lib/pro/dates";
import { radius, shadows } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGrid } from "@/shared/lib/useGrid";
import { Fade } from "./Fade";

type Sheet = "case" | "client" | "event" | null;
const TONES: readonly (readonly [string, string])[] = [["#1668F0", "#00CFE8"], ["#7A5CFF", "#B197FC"], ["#00A870", "#5EDDB0"], ["#E0457F", "#FF9AB8"]];

// "Tezkor amallar": four big coloured tiles in a 2×2 grid, straight under the hero — new client, new case, upload a document,
// set a meeting. Client, case and meeting open their form in place; the upload goes to Files.
export function HomeQuick() {
  const { t } = useT();
  const router = useRouter();
  const g = useGrid({ count: 4 });
  const [open, setOpen] = useState<Sheet>(null);
  const items: { key: string; icon: IconName; on: () => void }[] = [
    { key: "quickClient", icon: "user-plus", on: () => setOpen("client") },
    { key: "quickCase", icon: "folder-plus", on: () => setOpen("case") },
    { key: "quickDoc", icon: "upload", on: () => router.push("/pro/files" as never) },
    { key: "quickMeeting", icon: "calendar", on: () => setOpen("event") },
  ];
  return (
    <View style={s.col}>
      <Text variant="h4">{t("shm.dash.quickActions")}</Text>
      <View style={[s.grid, g.row]} onLayout={g.onLayout}>
        {g.ready ? items.map((x, i) => (
          <View key={x.key} style={[s.cell, g.tile]}>
            <Fade i={i}>
              <PressableScale onPress={x.on} accessibilityRole="button" accessibilityLabel={t(`shm.dash.${x.key}`)}>
                <LinearGradient colors={[...TONES[i]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, shadows.s1]}>
                  <View style={s.ring} pointerEvents="none" />
                  <View style={s.ico}><Icon name={x.icon} size={20} tone="white" /></View>
                  <Text variant="small" weight="bold" tone="white" numberOfLines={2}>{t(`shm.dash.${x.key}`)}</Text>
                </LinearGradient>
              </PressableScale>
            </Fade>
          </View>
        )) : null}
      </View>
      <CaseFormSheet visible={open === "case"} onClose={() => setOpen(null)} item={null} />
      <ClientFormSheet visible={open === "client"} onClose={() => setOpen(null)} />
      <EventFormSheet visible={open === "event"} onClose={() => setOpen(null)} event={null} day={todayKey()} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "48.5%" },
  tile: { height: 104, padding: 14, borderRadius: radius.rl, justifyContent: "space-between", overflow: "hidden" },
  ring: { position: "absolute", width: 90, height: 90, borderRadius: 45, borderWidth: 11, borderColor: "rgba(255,255,255,0.15)", right: -26, top: -26 },
  ico: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
});
