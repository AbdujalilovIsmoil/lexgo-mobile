import { Image, StyleSheet, View } from "react-native";
import { DocActions, subcatImage, type DocActionHandlers, type DocWays, type Service } from "@/entities/service";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type TileActions = DocActionHandlers;
type Props = TileActions & { service: Service; locked: boolean; downloading: boolean; error?: string; ways?: DocWays };

// A catalogue service: the direction's illustration, the full name, the "with an advocate" ribbon, then the four ways forward.
export function ServiceTile({ service: sv, locked, downloading, error, ways, ...handlers }: Props) {
  const c = useColors();
  const { t } = useT();
  const doc = !!sv.documentTemplateId;
  const art = subcatImage(sv.subcategory ?? "");
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: sv.advokatRequired ? c.warn : c.line }]}>
      <View style={s.top}>
        <View style={[s.icon, { backgroundColor: c.tint2 }]}>{art ? <Image source={art} style={s.art} resizeMode="contain" /> : <Icon name={doc ? "file-text" : "briefcase"} size={22} color={c.accent} />}</View>
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={6}>{sv.name}</Text>
          <View style={s.pills}>
            <Pill label={t(doc ? "ntd.svTemplate" : "ntd.svService")} tone="gray" icon={doc ? "file-text" : "briefcase"} small />
            {sv.advokatRequired ? <Pill label={t("csv.advokatOnly")} tone="warn" icon="shield" small /> : null}
          </View>
        </View>
      </View>
      <DocActions hasDoc={doc} advokatOnly={sv.advokatRequired} locked={locked} downloading={downloading} error={error} ways={ways} {...handlers} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  art: { width: 46, height: 46 },
  col: { flex: 1, gap: 8 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
