import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { FormInput } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import { usePulse } from "@/shared/lib/usePulse";
import type { useSos } from "../model/useSos";
import { CategoryGrid } from "./CategoryGrid";

// Idle stage: "Vaziyatni tanlang" → type grid, short description, big red connect button, hint.
export function SosForm({ sos }: { sos: ReturnType<typeof useSos> }) {
  const { t } = useT();
  const b = usePulse(1800, true);
  const beat = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(b.value, [0, 1], [1, 1.035]) }] }));
  const btn = useInstructorTarget("button:sos-connect", { label: t("cxSos.connect"), type: "button" });
  return (
    <View style={s.card}>
      <Text variant="h4">{t("cxSos.formTitle")}</Text>
      <Text variant="small" tone="gray">{t("cxSos.catLabel")}</Text>
      <CategoryGrid value={sos.cat} onChange={sos.setCat} />
      <FormInput control={sos.control} name="desc" label={t("cxSos.descLabel")} placeholder={t("cxSos.descPh")} multiline maxLength={1000} style={s.ta} />
      <Animated.View {...btn} style={[s.beat, beat]}>
        <Button title={t("cxSos.connect")} icon="alert-triangle" full size="lg" disabled={sos.busy} onPress={() => void sos.trigger()} style={s.red} />
      </Animated.View>
      <Text variant="caption" tone="gray" center>{t("cxSos.hint")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  ta: { minHeight: 96, textAlignVertical: "top" },
  beat: { shadowColor: "#E11D48", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
  red: { backgroundColor: "#E11D48" },
});
