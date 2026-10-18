import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { OrderPanel, PassportToggle } from "@/features/order-service";
import { hasTemplate, usePriceLabel, useServicePassport, type Service } from "@/entities/service";
import { useIsAuthed } from "@/entities/session";
import { Button, SheetBack, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ServiceDocActions } from "./ServiceDocActions";
import { ServiceHead } from "./ServiceHead";

type Props = { service: Service; onBack?: () => void; navigate: (fn: () => void) => void; packageId?: string; preSeller?: { id: string; name: string } };

// One service (drawer or page, reached from links and topic lists): a document service offers the
// catalogue card's four buttons; any other is ordered from an advocate right here.
export function ServiceDetail({ service, onBack, navigate, packageId, preSeller }: Props) {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const price = usePriceLabel();
  const full = useServicePassport(service.id).data?.service ?? service;
  return (
    <View style={s.col}>
      {onBack ? <SheetBack onPress={onBack} /> : null}
      <ServiceHead service={full} />
      {full.description && full.description !== full.name ? <Text variant="body" tone="gray">{full.description}</Text> : null}
      {hasTemplate(full) ? (
        <>
          <View style={s.price}><Text variant="small" tone="gray">{t("csv.price")}</Text><Text variant="h4" tone="accent">{price(full)}</Text></View>
          <PassportToggle serviceId={full.id} />
          <ServiceDocActions service={full} navigate={navigate} />
        </>
      ) : authed ? (
        <OrderPanel service={full} packageId={packageId} preSeller={preSeller} onChat={() => navigate(() => router.navigate("/(tabs)/orders"))} />
      ) : (
        <View style={s.col}>
          <Text variant="body" tone="warn">{t("services.orderHint")}</Text>
          <Button title={t("auth.submit")} onPress={() => navigate(() => router.push("/auth/login"))} variant="gradient" icon="log-in" full />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 }, price: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } });
