import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/shared/theme";
import { RegisterForm } from "@/features/auth";
import { AuthHero } from "@/widgets/auth-hero";
import { useT } from "@/shared/i18n";
import { HeroScroll } from "@/shared/ui";

// Sign-up for every account kind. `?ref=CODE` (a referral link) pre-fills the referral field and
// `?role=advokat` pre-selects the account kind.
export function RegisterPage() {
  const c = useColors();
  const { t } = useT();
  const { ref, role } = useLocalSearchParams<{ ref?: string; role?: string }>();
  return (
    <View style={[s.fill, { backgroundColor: c.bg }]}>
      <HeroScroll keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AuthHero title={t("auth.registerTitle")} subtitle={t("auth.registerSub")} />
        <View style={s.body}>
          <RegisterForm referral={typeof ref === "string" ? ref : undefined} role={typeof role === "string" ? role : undefined} />
        </View>
      </HeroScroll>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 24 },
});
