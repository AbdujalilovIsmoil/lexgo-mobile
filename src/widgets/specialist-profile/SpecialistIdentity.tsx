import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { Avatar, Icon, Pill, Text } from "@/shared/ui";
import { brand, useColors } from "@/shared/theme";

import { useT } from "@/shared/i18n";

const LANG: Record<string, string> = { "uz-latn": "O'zbek", "uz-cyrl": "Ўзбек", uz: "O'zbek", ru: "Русский", en: "English" };

// Under the cover, laid out like the client's profile header: the avatar sits on the cover's lower edge with a
// ring in the page colour (verified seal on it); name, kind · region, the star row and the chips are left-aligned.
export function SpecialistIdentity({ lawyer: l, top }: { lawyer: Lawyer; top?: boolean }) {
  const c = useColors();
  const { t } = useT();
  const geo = useGeoLabels();
  const stars = l.rated ? Math.round(l.rating) : 0;
  const place = [l.region ? geo.region(l.region) : "", l.district ?? ""].filter(Boolean).join(" · ");
  return (
    <View style={s.wrap}>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={[s.ring, { backgroundColor: c.bg }]}>
        <Avatar name={l.name} size={92} />
        {l.verified ? <View style={[s.seal, { backgroundColor: c.accent, borderColor: c.bg }]}><Icon name="check" size={13} color={brand.white} /></View> : null}
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(320)} style={s.col}>
        <Text variant="h2" numberOfLines={2} style={s.name}>{l.name}</Text>
        {place ? <View style={s.line}><Icon name="map-pin" size={14} tone="gray" /><Text variant="small" tone="gray">{place}</Text></View> : null}
        {l.languages.length ? <View style={s.line}><Icon name="globe" size={14} tone="gray" /><Text variant="small" tone="gray" numberOfLines={1} style={s.flex}>{[...new Set(l.languages.map((x) => LANG[x] ?? x))].join(" · ")}</Text></View> : null}
        <View style={s.line}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Animated.View key={i} entering={FadeIn.delay(240 + i * 70)}><Ionicons name="star" size={15} color={i < stars ? c.warn : c.line} /></Animated.View>
          ))}
          <Text variant="small" tone="gray">{l.rated ? `${l.rating.toFixed(1).replace(".", ",")} · ${t("lw.reviews", { n: l.reviews })}` : t("lawyers.card.unrated")}</Text>
        </View>
        <View style={s.pills}>
          <Pill label={t(l.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer")} tone="blue" icon="user" small />
          {l.publicId ? <Pill label={l.publicId} tone="gray" small /> : null}
          {l.verified ? <Pill label={t("cpr.verifiedProfile")} tone="ok" icon="shield" small /> : null}
          {l.promoted || top ? <Pill label={t("mkw.promo.top")} tone="warn" icon="volume-2" small /> : null}
          {l.isNew ? <Pill label={t("common.new")} tone="cy" small /> : null}
          {l.available ? null : <Pill label={t("mk1.busy")} tone="warn" small />}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: -46, gap: 4 },
  ring: { alignSelf: "flex-start", padding: 5, borderRadius: 56 },
  seal: { position: "absolute", right: 2, bottom: 2, width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  col: { gap: 6 },
  name: { marginTop: 4 },
  line: { flexDirection: "row", alignItems: "center", gap: 4 },
  flex: { flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
});
