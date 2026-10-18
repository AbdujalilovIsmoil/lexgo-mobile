import { View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { DocPrice } from "@/entities/my-document";

const ICON: Record<DocPrice["kind"], IconName> = { wait: "clock", off: "x-circle", paid: "check-circle", info: "tag", none: "check" };
const LABEL: Record<DocPrice["kind"], string> = { wait: "priceWait", off: "priceCancelled", paid: "pricePaid", info: "priceInfo", none: "priceNone" };

// Money line of a list card: amount (when there is one) and what it means right now.
export function DocPriceLine({ price }: { price: DocPrice }) {
  const { t } = useT();
  const c = useColors();
  const color = price.kind === "paid" || price.kind === "none" ? c.ok : price.kind === "off" ? c.err : c.gray;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon name={ICON[price.kind]} size={16} color={color} />
      {price.amount > 0 ? <Text variant="small" weight="bold">{`${fmtMoney(price.amount)} ${t("adm.currency")}`}</Text> : null}
      <Text variant="caption" tone={price.kind === "none" ? "ok" : "gray"}>{t(`dm11.${LABEL[price.kind]}`)}</Text>
    </View>
  );
}
