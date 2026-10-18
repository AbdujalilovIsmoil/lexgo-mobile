import { View } from "react-native";
import type { Lawyer } from "../model/types";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Up to two service names (promoted ones first) and "+n" for the rest, like the web card.
export function ServiceTitles({ lawyer }: { lawyer: Lawyer }) {
  const { t } = useT();
  const all = [...lawyer.services].sort((a, b) => Number(b.sponsored) - Number(a.sponsored)).map((x) => x.title).filter(Boolean);
  if (!all.length) return null;
  return (
    <View style={{ gap: 2 }}>
      {all.slice(0, 2).map((x) => <Text key={x} variant="small" numberOfLines={1}>{`• ${x}`}</Text>)}
      {all.length > 2 ? <Text variant="caption" tone="gray2">{t("mk2.servicesMore", { n: all.length - 2 })}</Text> : null}
    </View>
  );
}
