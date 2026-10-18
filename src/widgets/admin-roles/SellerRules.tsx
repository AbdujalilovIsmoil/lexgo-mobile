import { type SellerRule } from "@/entities/admin-roles";
import { SectionCard } from "@/shared/ui/admin";
import { Pill, Text } from "@/shared/ui";
import { View } from "react-native";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Which service prefixes each seller type may not sell (yurist cannot take criminal- / administrative- services).
export function SellerRules({ rules }: { rules: SellerRule[] }) {
  const { t } = useT();
  if (!rules.length) return null;
  return (
    <SectionCard title={t("admRoles.sellerRules")}>
      {rules.map((r) => {
        const key = `admRoles.sellerType.${r.sellerType}`;
        return (
          <View key={r.sellerType} style={{ gap: 6 }}>
            <Text variant="body" weight="bold">{t(key) !== key ? t(key) : humanizeSlug(r.sellerType)}</Text>
            {r.rule ? <Text variant="small" tone="gray">{r.rule}</Text> : null}
            {r.blockedPrefixes.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {r.blockedPrefixes.map((p) => <Pill key={p} tone="err" small label={`${p}*`} />)}
              </View>
            ) : <Text variant="caption" tone="gray2">{t("admRoles.noBlocked")}</Text>}
          </View>
        );
      })}
    </SectionCard>
  );
}
