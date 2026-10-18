import { memo } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { CcTicket } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { entryLabel } from "../lib/labels";
import { PAY_COLOR, payGroup } from "../lib/payGroups";
import { HrmStatus } from "./HrmStatus";
import type { PayrollEntry } from "../model/typesOps";

// One payroll entry ticket: strip by type bucket, amount on the right (red for deductions), status pill as chip.
function Row({ item, who, index = 0 }: { item: PayrollEntry; who: string; index?: number }) {
  const { t } = useT();
  const c = useColors();
  const tint = PAY_COLOR[payGroup(item.type)];
  const neg = ["penalty", "deduction", "advance"].includes(item.type);
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40)}>
      <CcTicket
        tint={tint} icon="credit-card" title={who || item.title} subtitle={[entryLabel(t, item.type), item.period].join(" · ")}
        badge={<Text variant="body" weight="bold" style={{ color: neg ? "#EF4444" : c.ink }}>{neg ? "-" : ""}{fmtMoney(item.amount)} {t("adm.currency")}</Text>}
        chips={<><HrmStatus status={item.status} />{item.title && item.title !== item.type ? <Text variant="caption" tone="gray" numberOfLines={1}>{item.title}</Text> : null}</>}
      />
    </Animated.View>
  );
}

export const PayrollRow = memo(Row);
