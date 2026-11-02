import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { CaseFormSheet } from "@/features/pro-case-form";
import { EventFormSheet } from "@/features/pro-event-form";
import { todayKey } from "@/shared/lib/pro/dates";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Sheet = "case" | "event" | null;

// "Tezkor amallar": the four things a professional starts from the home — new client, new case, upload a document, set a meeting — as one
// calm card in the page's language: a small kicker, then four equal columns (a tinted icon chip over a short label). New case and the
// meeting open their form in place; a new client opens its own page; the upload goes to Files.
export function HomeQuick() {
  const { t } = useT();
  const router = useRouter();
  const c = useColors();
  const [open, setOpen] = useState<Sheet>(null);
  const items: { key: string; icon: IconName; tint: string; on: () => void }[] = [
    { key: "quickClient", icon: "user-plus", tint: "#1668F0", on: () => router.push("/pro/clients/new" as never) },
    { key: "quickCase", icon: "folder-plus", tint: "#7A5CFF", on: () => setOpen("case") },
    { key: "quickDoc", icon: "upload", tint: "#00A870", on: () => router.push("/pro/files" as never) },
    { key: "quickMeeting", icon: "calendar", tint: "#E8662E", on: () => setOpen("event") },
  ];
  return (
    <View style={s.col}>
      <Text variant="caption" weight="bold" tone="gray" style={s.kick}>{t("shm.dash.quickActions").toUpperCase()}</Text>
      <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        {items.map((x) => (
          <PressableScale key={x.key} onPress={x.on} scale={0.94} accessibilityRole="button" accessibilityLabel={t(`shm.dash.${x.key}`)} style={s.item}>
            <View style={[s.ico, { backgroundColor: `${x.tint}1F` }]}><Icon name={x.icon} size={21} color={x.tint} /></View>
            <Text variant="caption" weight="semibold" center numberOfLines={2} maxFontSizeMultiplier={1.15}>{t(`shm.dash.${x.key}`)}</Text>
          </PressableScale>
        ))}
      </View>
      <CaseFormSheet visible={open === "case"} onClose={() => setOpen(null)} item={null} />
      <EventFormSheet visible={open === "event"} onClose={() => setOpen(null)} event={null} day={todayKey()} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  kick: { letterSpacing: 0.8, paddingHorizontal: 4 },
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: "center", gap: 8, paddingHorizontal: 4 },
  ico: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
});
