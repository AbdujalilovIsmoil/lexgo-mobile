import { StyleSheet, View } from "react-native";
import { SosForm, SosStatus, useSos } from "@/features/sos-request";
import { SosHero, SosHotline, SosInfo } from "@/widgets/sos";
import { Screen, SecondaryHeader } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { HOME_BG } from "@/widgets/client-dash";
import { useT } from "@/shared/i18n";

// Client SOS (web /portal/client/sos): hero, hotline strip, then the form / connecting / connected / sent
// panel, and the "how it works" cards while the form is open. POST /sos is fail-soft.
export function SosPage() {
  const { colors: c, dark } = useTheme();
  const ground = dark ? c.canvas : HOME_BG;
  const { t } = useT();
  const sos = useSos();
  return (
    <View style={[s.fill, { backgroundColor: ground }]}>
      <SecondaryHeader title={t("cxSos.title")} />
      <Screen topInset={false} ground={ground} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <SosHero />
        <SosHotline />
        {sos.stage === "idle" ? (
          <>
            <SosForm sos={sos} />
            <SosInfo />
          </>
        ) : (
          <SosStatus stage={sos.stage} req={sos.req} onAgain={sos.again} />
        )}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 16 } });
