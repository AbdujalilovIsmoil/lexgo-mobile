import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";

const LANG: Record<string, string> = { "uz-latn": "O'zbek", "uz-cyrl": "Ўзбек", uz: "O'zbek", ru: "Русский", en: "English" };

export function AboutTab({ lawyer }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.col}>
      <Text variant="body" tone={lawyer.bio ? "ink" : "gray2"}>{lawyer.bio || t("lw.noBio")}</Text>
      {lawyer.specializations.length ? (
        <View style={s.pills}>{lawyer.specializations.map((x) => <Pill key={x} label={humanizeSlug(x)} tone="blue" small />)}</View>
      ) : null}
      {lawyer.languages.length ? (
        <View style={s.line}><Icon name="globe" size={16} tone="gray" /><Text variant="small" tone="gray">{[...new Set(lawyer.languages.map((l) => LANG[l] ?? l))].join(", ")}</Text></View>
      ) : null}
      {lawyer.verified ? (
        <View style={[s.note, { backgroundColor: c.okBg }]}><Icon name="shield" size={18} color={c.ok} /><Text variant="small" style={s.flex}>{t("lw.verified")}</Text></View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  note: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  flex: { flex: 1 },
});
