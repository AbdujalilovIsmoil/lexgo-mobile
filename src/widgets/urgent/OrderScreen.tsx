import { ScrollView, StyleSheet, View } from "react-native";
import { Button, ErrorView, SecondaryHeader, Skeleton, Text } from "@/shared/ui";
import { KeyboardLift } from "@/shared/ui/admin";
import { GateSheet, OrderForm, useOrderForm } from "@/features/urgent-request";
import { CardGateSheet } from "@/features/payments";
import { useUrgentLabels } from "@/entities/urgent";
import { useTheme } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { HOME_BG } from "@/widgets/client-dash";
import { ServiceCards } from "./ServiceCards";

// /urgent/new?service=<key>: the order form with the total pinned above the keyboard. Without a (known) service the list is shown.
export function OrderScreen({ service, fromUrgent }: { service: string; fromUrgent?: boolean }) {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const label = useUrgentLabels();
  const f = useOrderForm(service, fromUrgent);
  const s = f.service;
  return (
    <View style={[st.fill, { backgroundColor: dark ? c.canvas : HOME_BG }]}>
      <SecondaryHeader title={s ? label.kind(s.key, s.title) : t("ug2.pickTitle")} />
      <KeyboardLift>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {f.cat.isLoading ? <Skeleton height={320} round={20} /> : f.cat.isError ? <ErrorView error={f.cat.error} onRetry={() => void f.cat.refetch()} /> : s ? <OrderForm f={f} /> : <ServiceCards />}
        </ScrollView>
        {s ? (
          <View style={[st.foot, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="gray">{t("ug2.total")}</Text>
              <Text variant="h3">{fmtMoney(f.price)} {t("adm.currency")}</Text>
            </View>
            <Button title={t("ug2.submit")} icon="send" variant="gradient" loading={f.pending} onPress={f.submit} />
          </View>
        ) : null}
      </KeyboardLift>
      <CardGateSheet {...f.cardGate} />
      <GateSheet message={f.gate} services={f.services} onClose={f.closeGate} onPick={f.pick} />
    </View>
  );
}

const st = StyleSheet.create({ fill: { flex: 1 }, foot: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 } });
