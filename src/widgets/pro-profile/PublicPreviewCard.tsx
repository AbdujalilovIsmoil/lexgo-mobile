import { StyleSheet, View } from "react-native";
import type { ProProfile } from "@/entities/pro-profile";
import { useColors } from "@/shared/theme";
import { Avatar, Icon, Pill, Skeleton, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { pub: ProProfile | null | undefined; loading: boolean; avatarUrl: string };

// "How clients see you" — the marketplace card built from GET /marketplace/lawyers/{id}. The phone is never part of it.
export function PublicPreviewCard({ pub, loading, avatarUrl }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  if (loading) return <Skeleton height={150} round={20} />;
  if (!pub) return <SectionCard title={t("sl5.preview.title")}><Notice tone="warn" text={t("sl5.preview.hidden")} /></SectionCard>;
  const rated = pub.reviewsCount >= 5 && pub.rating > 0;
  return (
    <SectionCard title={t("sl5.preview.title")}>
      <View style={s.row}>
        <Avatar name={pub.name} uri={avatarUrl || undefined} size={52} />
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={1}>{pub.name}</Text>
          <Text variant="caption" tone="gray">{rated ? t("sl5.preview.rating", { r: pub.rating.toFixed(1), n: pub.reviewsCount }) : t("sl5.preview.new")}</Text>
        </View>
        <View style={[s.dot, { backgroundColor: pub.onlineNow && pub.available ? c.ok : c.gray2 }]} />
      </View>
      <View style={s.pills}>
        {pub.verified ? <Pill label={pub.badgeLabel || t("sl1.verified")} tone="ok" icon="check-circle" small /> : null}
        {pub.priceFrom ? <Pill label={t("sl5.preview.from", { sum: som(pub.priceFrom) })} small /> : null}
        {pub.serviceTitles.length ? <Pill label={t("sl5.preview.services", { n: pub.serviceTitles.length })} tone="cy" small /> : null}
      </View>
      {pub.bio ? <Text variant="small" tone="gray" numberOfLines={3}>{pub.bio}</Text> : null}
      <View style={s.row}>
        <Icon name="lock" size={14} tone="gray" />
        <Text variant="caption" tone="gray2" style={s.col}>{t("sl5.preview.noPhone")}</Text>
      </View>
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  col: { flex: 1, gap: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
