import { StyleSheet, View } from "react-native";
import { dayText, typeLabel, usePublicAchievements } from "@/entities/pro-achievements";
import { Text } from "@/shared/ui";
import { ProfileSection, ShowMore } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Yutuqlar" on a specialist's page: the approved achievements the backend lists publicly (type, title, date, category), ten at a time.
// It stays out of sight while loading, when the list is empty and when it cannot be read — the page never waits for it or shows an error.
export function AchievementsSection({ sellerId }: { sellerId: string }) {
  const { t, locale } = useT();
  const c = useColors();
  const q = usePublicAchievements(sellerId);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  if (!items.length) return null;
  const total = q.data?.pages[q.data.pages.length - 1]?.total ?? items.length;
  return (
    <ProfileSection accent="gold" icon="award" title={t("ach.publicTitle")} badge={total}>
      <View style={s.col}>
        {items.map((a) => (
          <View key={a.key} style={[s.row, { backgroundColor: c.surface2 }]}>
            <Text variant="caption" weight="bold" tone="accent">{typeLabel(a.type, t) || "—"}</Text>
            <Text variant="body" weight="bold">{a.title}</Text>
            <Text variant="caption" tone="gray">{[dayText(a.achievedAt, locale), a.categoryName].filter(Boolean).join(" · ")}</Text>
          </View>
        ))}
      </View>
      <ShowMore left={q.hasNextPage ? Math.max(1, total - items.length) : 0} expanded={false} onMore={() => void q.fetchNextPage()} onLess={() => undefined} />
    </ProfileSection>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { gap: 3, padding: 14, borderRadius: 16 },
});
