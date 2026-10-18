import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Avatar, Pill, Skeleton, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { StatusText } from "./useStatusText";

type Pub = { name: string; region: string; specializations: string[]; rating: number; reviewsCount: number } | null | undefined;

// The seller card as the marketplace draws it, with the online badge and the next-open text from the draft schedule.
export function MarketPreview({ pub, loading, status }: { pub: Pub; loading: boolean; status: StatusText }) {
  const { t } = useT();
  const c = useColors();
  return (
    <SectionCard title={t("availUx.preview")}>
      {loading ? (
        <Skeleton height={76} round={radius.r} />
      ) : pub ? (
        <View style={[s.card, { backgroundColor: c.surface2, borderColor: c.line }]} accessible accessibilityLabel={`${pub.name}. ${status.title}. ${status.sub}`}>
          <Avatar name={pub.name} size={48} />
          <View style={s.col}>
            <Text variant="body" weight="semibold" numberOfLines={1}>{pub.name}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{[pub.specializations[0], pub.region].filter(Boolean).join(" · ")}</Text>
            <Text variant="caption" tone={status.state === "online" ? "ok" : "gray"} numberOfLines={2}>{status.sub}</Text>
          </View>
          <Pill label={status.state === "online" ? t("availUx.online") : t("availUx.closed")} tone={status.state === "online" ? "ok" : "gray"} small live={status.state === "online"} />
        </View>
      ) : (
        <Text variant="small" tone="gray">{t("sl8.market.hidden")}</Text>
      )}
      <Text variant="caption" tone="gray2">{t("availUx.previewNote")}</Text>
    </SectionCard>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.r, borderWidth: 1 },
  col: { flex: 1, gap: 1 },
});
