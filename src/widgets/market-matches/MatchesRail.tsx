import { ScrollView, StyleSheet, View } from "react-native";
import { useIsAuthed } from "@/entities/session";
import { useLawyers, useMyMatches } from "@/entities/lawyer";
import { Avatar, Card, Pill, SectionHeader, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

// "Picked for you" — GET /matching/me, shown to signed-in clients that have matches.
export function MatchesRail({ onOpen }: { onOpen: (userId: string) => void }) {
  const { t } = useT();
  const { data } = useMyMatches(useIsAuthed());
  const { data: all } = useLawyers(); // only specialists the marketplace actually lists (a match may be hidden or unverified)
  const open = new Set(all?.map((l) => l.userId));
  const rows = (data ?? []).filter((m) => open.has(m.userId));
  if (!rows.length) return null;
  return (
    <View style={s.wrap}>
      <View style={s.pad}><SectionHeader title={t("mk1.matchesTitle")} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} keyboardShouldPersistTaps="handled">
        {rows.slice(0, 8).map((m) => (
          <Card key={m.userId} onPress={() => onOpen(m.userId)} style={s.card}>
            <View style={s.top}>
              <Avatar name={m.name} size={40} square />
              <View style={s.flex}>
                <Text variant="body" weight="bold" numberOfLines={1}>{m.name}</Text>
                <Text variant="caption" tone="gray" numberOfLines={1}>{humanizeSlug(m.area.split(",")[0]?.trim() ?? "")}</Text>
              </View>
            </View>
            {m.pct > 0 ? <Pill label={t("mk1.aiMatch", { pct: m.pct })} tone="ok" icon="zap" small /> : null}
            {m.reason ? <Text variant="caption" tone="gray" numberOfLines={2}>{m.reason}</Text> : null}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  pad: { paddingHorizontal: 16 },
  row: { gap: 12, paddingHorizontal: 16 },
  card: { width: 230, gap: 8, padding: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
