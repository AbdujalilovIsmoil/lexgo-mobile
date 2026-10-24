import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useLawyer } from "@/entities/lawyer";
import type { MarketOrder } from "@/entities/order";
import { Avatar, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The specialist on this purchase: public profile data only (no phone, TZ §6), tap opens the profile drawer. An unrated one says so.
export function SellerCard({ order: o }: { order: MarketOrder }) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const { data: l } = useLawyer(o.lawyerUserId);
  const name = l?.name || o.lawyerName;
  if (!name) return null;
  const kind = l ? t(l.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer") : "";
  const open = () => o.lawyerUserId && router.push({ pathname: "/specialist/[id]", params: { id: o.lawyerUserId } });
  return (
    <Card onPress={l ? open : undefined} style={s.card}>
      <Avatar name={name} size={48} square />
      <View style={s.info}>
        <Text variant="caption" tone="gray">{t("mk4.seller")}</Text>
        <View style={s.row}>
          <Text variant="body" weight="bold" numberOfLines={1} style={s.flex}>{name}</Text>
          {l?.verified ? <Icon name="check-circle" size={16} color={c.accent} /> : null}
        </View>
        <Text variant="caption" tone="gray2" numberOfLines={1}>{[kind, l?.publicId || o.lawyerPublicId, l ? (l.rated ? `★ ${l.rating.toFixed(1)}` : t("lawyers.card.unrated")) : ""].filter(Boolean).join(" · ")}</Text>
      </View>
      {l ? <Icon name="chevron-right" size={18} tone="gray" /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  info: { flex: 1, gap: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flexShrink: 1 },
});
