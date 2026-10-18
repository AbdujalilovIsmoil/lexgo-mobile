import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { CaseFormSheet } from "@/features/pro-case-form";
import { ClientFormSheet } from "@/features/pro-client-form";
import { EventFormSheet } from "@/features/pro-event-form";
import { useT } from "@/shared/i18n";
import { todayKey } from "@/shared/lib/pro/dates";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { SectionCard } from "@/shared/ui/admin";

// Four shortcuts: new case / client / event open their sheets in place, "upload" goes to Fayllar.
export function QuickActions() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const [open, setOpen] = useState<"case" | "client" | "event" | null>(null);
  const items = [
    { k: "case", icon: "folder-plus", on: () => setOpen("case") },
    { k: "client", icon: "user-plus", on: () => setOpen("client") },
    { k: "doc", icon: "upload", on: () => router.push("/pro/files" as never) },
    { k: "event", icon: "calendar", on: () => setOpen("event") },
  ] as const;
  return (
    <SectionCard title={t("aw1.q.title")}>
      <View style={s.row}>
        {items.map((i) => (
          <PressableScale key={i.k} onPress={i.on} style={[s.item, { backgroundColor: c.tint }]}>
            <Icon name={i.icon} size={22} tone="accent" />
            <Text variant="caption" weight="semibold" center numberOfLines={2}>{t(`aw1.q.${i.k}`)}</Text>
          </PressableScale>
        ))}
      </View>
      <CaseFormSheet visible={open === "case"} onClose={() => setOpen(null)} item={null} />
      <ClientFormSheet visible={open === "client"} onClose={() => setOpen(null)} />
      <EventFormSheet visible={open === "event"} onClose={() => setOpen(null)} event={null} day={todayKey()} />
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 8 }, item: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 16 } });
