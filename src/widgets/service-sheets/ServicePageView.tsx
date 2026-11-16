import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OrderPanel, PassportToggle } from "@/features/order-service";
import { hasTemplate, type PassportBundle } from "@/entities/service";
import { useIsAuthed } from "@/entities/session";
import { useTheme } from "@/shared/theme";
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
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const authed = useIsAuthed();
  const docs = passport.requiredDocuments;
  return (
    <View style={s.col}>
      <ServiceHero service={sv} />
      <ServiceFacts service={sv} passport={passport} />
      {sv.description && sv.description !== sv.name ? <Animated.View entering={FadeInDown.delay(180).duration(300)}><Text variant="body" tone="gray">{sv.description}</Text></Animated.View> : null}
      {docs.length ? (
        <Animated.View entering={FadeInDown.delay(240).duration(300)} style={[s.docs, { backgroundColor: c.glassFill, borderColor: dark || glass ? c.glassLine : "#E6EBF3" }, !glass && s.shadow]}>
          <Text variant="h4" style={s.cardTitle}>{t("svh.docs")}</Text>
          {docs.map((d, i) => <View key={i} style={s.doc}><Icon name="check-circle" size={17} color={c.ok} /><Text variant="body" style={s.flex}>{d}</Text></View>)}
        </Animated.View>
      ) : null}
      <ServiceTerms serviceId={sv.id} />
      <Animated.View entering={FadeInDown.delay(300).duration(300)} style={s.col}>
        <Text variant="h4" style={s.section}>{t("svh.order")}</Text>
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
  docs: { gap: 10, padding: 16, borderRadius: 18, borderWidth: 1 },
  cardTitle: { fontSize: 15.5, lineHeight: 20, marginBottom: 2 },
  section: { fontSize: 17, lineHeight: 22, marginTop: 4 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
  doc: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
});
