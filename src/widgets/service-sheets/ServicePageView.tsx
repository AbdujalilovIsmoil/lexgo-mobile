import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OrderPanel, PassportToggle } from "@/features/order-service";
import { hasTemplate, type PassportBundle } from "@/entities/service";
import { useIsAuthed } from "@/entities/session";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ServiceDocActions } from "./ServiceDocActions";
import { ServiceFacts } from "./ServiceFacts";
import { ServiceHero } from "./ServiceHero";
import { ServiceTerms } from "./ServiceTerms";

type Props = { data: PassportBundle; packageId?: string; preSeller?: { id: string; name: string } };
const now = (fn: () => void) => fn();

// A service as a page: the hero, the three facts, what it is, the papers to bring (a checklist), the marketplace's terms (review, what
// the specialist will do, rules, guarantees), then the way to order it — a document service offers its four buttons, any other is ordered
// from an advocate right here — and the full passport folded away.
export function ServicePageView({ data: { service: sv, passport }, packageId, preSeller }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const authed = useIsAuthed();
  const docs = passport.requiredDocuments;
  return (
    <View style={s.col}>
      <ServiceHero service={sv} />
      <ServiceFacts service={sv} passport={passport} />
      {sv.description && sv.description !== sv.name ? <Animated.View entering={FadeInDown.delay(180).duration(300)}><Text variant="body" tone="gray">{sv.description}</Text></Animated.View> : null}
      {docs.length ? (
        <Animated.View entering={FadeInDown.delay(240).duration(300)} style={[s.docs, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <Text variant="small" weight="bold">{t("svh.docs")}</Text>
          {docs.map((d, i) => <View key={i} style={s.doc}><Icon name="check-circle" size={16} color={c.ok} /><Text variant="small" style={s.flex}>{d}</Text></View>)}
        </Animated.View>
      ) : null}
      <ServiceTerms serviceId={sv.id} />
      <Animated.View entering={FadeInDown.delay(300).duration(300)} style={s.col}>
        <Text variant="h4">{t("svh.order")}</Text>
        {hasTemplate(sv) ? <ServiceDocActions service={sv} navigate={now} /> : authed ? <OrderPanel service={sv} packageId={packageId} preSeller={preSeller} onChat={() => router.navigate("/(tabs)/orders")} /> : (
          <View style={s.col}>
            <Text variant="body" tone="warn">{t("services.orderHint")}</Text>
            <Button title={t("auth.submit")} onPress={() => router.push("/auth/login")} variant="gradient" icon="log-in" full />
          </View>
        )}
      </Animated.View>
      <PassportToggle serviceId={sv.id} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  docs: { gap: 10, padding: 14, borderRadius: 18, borderWidth: 1 },
  doc: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
});
