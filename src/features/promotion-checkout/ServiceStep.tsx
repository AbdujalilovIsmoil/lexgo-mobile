import { StyleSheet, View } from "react-native";
import type { ProService } from "@/entities/pro-service";
import { Notice } from "@/shared/ui/sel";
import { Skeleton, Text } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { Choice } from "./Choice";

type Props = { services: ProService[]; loading: boolean; value: string; onChange: (id: string) => void };

// Which of the seller's active services to push (service promotion only).
export function ServiceStep({ services, loading, value, onChange }: Props) {
  const { t } = useT();
  const som = useSom();
  return (
    <View style={s.box}>
      <Text variant="small" weight="semibold">{t("promoSeller.ck.pickService")}</Text>
      {loading ? <Skeleton height={56} round={14} /> : null}
      {!loading && !services.length ? <Notice tone="warn" text={t("promoSeller.ck.pickServiceNone")} /> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={t("promoSeller.ck.pickService")} style={s.box}>
        {services.map((x) => <Choice key={x.id} icon="briefcase" title={x.name} sub={x.effectivePrice ? `${som(x.effectivePrice)}` : undefined} on={value === x.id} onPress={() => onChange(x.id)} />)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 8 } });
