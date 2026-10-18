import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { Placement } from "@/entities/promotion";
import { PLACEMENTS } from "@/entities/promotion";
import { SectionCard } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Choice } from "./Choice";

const ICON = { banner: "image", profile_boost: "user-check", service_boost: "briefcase" } as const;
const KEY = { banner: "Banner", profile_boost: "Profile", service_boost: "Service" } as const;

type Props = { value: Placement | null; onChange: (p: Placement) => void; children?: ReactNode };

// Step 1 — where the promotion appears (banner · profile card in the list · one service), then what is promoted (`children`).
export function PlacementStep({ value, onChange, children }: Props) {
  const { t } = useT();
  return (
    <SectionCard title={t("promoSeller.ck.step1")}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t("promoSeller.ck.placementTitle")} style={s.list}>
        {PLACEMENTS.map((p) => (
          <Choice key={p} icon={ICON[p]} title={t(`promoSeller.placement${KEY[p]}`)} sub={t(`promoSeller.placement${KEY[p]}Hint`)} on={value === p} onPress={() => onChange(p)} />
        ))}
      </View>
      {children}
    </SectionCard>
  );
}

// The promoted person when no service is needed (profile card, banner).
export function SellerRow({ name }: { name: string }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.seller, { backgroundColor: c.surface2 }]} accessible accessibilityLabel={`${t("promoSeller.ck.seller")}: ${name}`}>
      <Icon name="user" size={18} color={c.accent} />
      <View style={s.fill}>
        <Text variant="caption" tone="gray">{t("promoSeller.ck.seller")}</Text>
        <Text variant="body" weight="semibold" numberOfLines={1}>{name || t("promoSeller.ck.previewSeller")}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 8 },
  seller: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.r, minHeight: 56 },
  fill: { flex: 1 },
});
