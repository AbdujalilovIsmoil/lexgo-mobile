import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { Avatar, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The head of a specialist's page (light): the monogram on a rounded square, the green "verified" pill, the name with the blue check, the
// type · region, the practice areas in one line and the rating; TOP / new / busy as small pills. `unrated` is the backend's own "not rated
// yet" text (rating v3), used when the specialist has no public rating.
export function SpecialistIdentity({ lawyer: l, top, unrated }: { lawyer: Lawyer; top?: boolean; unrated?: string }) {
  const c = useColors();
  const { t } = useT();
  const geo = useGeoLabels();
  const kind = t(l.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer");
  const region = l.region ? geo.region(l.region) : "";
  const areas = l.specializations.map((a) => geo.area(a)).join(", ");
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Avatar name={l.name} size={84} square />
        <View style={s.badges}>
          {l.verified ? (
            <View style={[s.ok, { backgroundColor: c.okBg }]}>
              <Ionicons name="checkmark-circle" size={15} color={c.ok} />
              <Text variant="caption" weight="bold" style={{ color: c.ok }}>{t("mkd.hero.verified")}</Text>
            </View>
          ) : null}
          <View style={s.pills}>
            {l.promoted || top ? <Pill label={t("mkw.promo.top")} tone="warn" icon="volume-2" small /> : null}
            {l.isNew ? <Pill label={t("common.new")} tone="cy" small /> : null}
            {l.available ? null : <Pill label={t("mk1.busy")} tone="warn" small />}
          </View>
        </View>
      </View>
      <View style={s.nameRow}>
        <Text variant="h2" numberOfLines={2} style={s.name}>{l.name}</Text>
        {l.verified ? <Ionicons name="checkmark-circle" size={22} color={c.accent} /> : null}
      </View>
      <Text variant="body" tone="gray" numberOfLines={1}>{kind}{region ? <Text variant="body" weight="bold" style={{ color: c.ink }}>{`  ·  ${region}`}</Text> : null}</Text>
      {areas ? <Text variant="small" numberOfLines={2} style={[s.areas, { color: c.ink }]}>{areas}</Text> : null}
      <View style={s.rate}>
        <Ionicons name="star" size={15} color="#F5B301" />
        <Text variant="small" tone="gray">{l.rated ? `${l.rating.toFixed(1).replace(".", ",")} · ${t("lw.reviews", { n: l.reviews })}` : unrated || t("lawyers.card.unrated")}</Text>
        {l.publicId ? <Text variant="small" tone="gray2">{`  ·  ${l.publicId}`}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, gap: 6, marginTop: 4 },
  head: { flexDirection: "row", alignItems: "flex-end", gap: 14, marginBottom: 8 },
  badges: { flex: 1, gap: 6, alignItems: "flex-start" },
  ok: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flexShrink: 1, fontSize: 26, lineHeight: 32 },
  areas: { fontSize: 14.5, lineHeight: 20, marginTop: 2 },
  rate: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
});
