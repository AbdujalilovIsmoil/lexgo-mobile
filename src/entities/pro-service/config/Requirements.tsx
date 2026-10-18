import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Icon, Text } from "@/shared/ui";

export type ConfigRequirements = {
  verified?: boolean; // the service needs a verified profile
  minExperienceYears?: number;
  minRating?: number;
  met?: boolean; // false → show the "clients won't see this service" note
};

// "Requirements" list (config.reqTitle): verified / experience / rating, plus reqUnmet when not met.
export function Requirements({ verified, minExperienceYears, minRating, met = true }: ConfigRequirements) {
  const c = useColors();
  const { t } = useT();
  const rows = [
    verified ? t("svcRules.cfgReqVerified") : "",
    minExperienceYears && minExperienceYears > 0 ? t("svcRules.cfgReqExperience", { n: minExperienceYears }) : "",
    minRating && minRating > 0 ? t("svcRules.cfgReqRating", { r: minRating }) : "",
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <View style={s.box}>
      <Text variant="h4">{t("svcRules.cfgReqTitle")}</Text>
      {rows.map((r) => (
        <View key={r} style={s.row}>
          <Icon name={met ? "check-circle" : "circle"} size={16} color={met ? c.ok : c.gray} />
          <Text variant="small">{r}</Text>
        </View>
      ))}
      {!met ? <Text variant="caption" tone="warn">{t("svcRules.cfgReqUnmet")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 6 }, row: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 28 } });
