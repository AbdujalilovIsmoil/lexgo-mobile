import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { ForgotForm } from "@/features/auth";
import { AuthHero } from "@/widgets/auth-hero";
import { useT } from "@/shared/i18n";
import { HeroScroll } from "@/shared/ui";

export function ForgotPage() {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <HeroScroll keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AuthHero title={t("auth.forgotTitle")} subtitle={t("auth.forgotSub")} />
        <View style={s.body}>
          <ForgotForm />
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
