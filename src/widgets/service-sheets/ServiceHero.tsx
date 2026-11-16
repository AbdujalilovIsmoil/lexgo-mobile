import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { subcatImage, type Service } from "@/entities/service";
import { useTheme } from "@/shared/theme";
import { Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The top of a service page (Adliya .svc-hero): the picture (or the kind's icon) on a soft square, the direction as a small grey line, the full
// name in the display face, and the kind / advocate tags under it. The price is the first of the facts below.
export function ServiceHero({ service: sv }: { service: Service }) {
  const { t } = useT();
  const { colors: c } = useTheme();
  const doc = !!sv.documentTemplateId;
  const art = subcatImage(sv.subcategory ?? "");
  return (
    <Animated.View entering={FadeIn.duration(260)} style={s.row}>
      <View style={[s.tile, { backgroundColor: c.tint2 }]}>{art ? <Image source={art} style={s.img} resizeMode="contain" /> : <Icon name={doc ? "file-text" : "briefcase"} size={28} color={c.accent} />}</View>
      <View style={s.text}>
        {sv.categoryTitle ? <Text variant="small" weight="semibold" tone="gray" numberOfLines={1}>{[sv.categoryTitle, sv.subcategory].filter(Boolean).join(" · ")}</Text> : null}
        <Text variant="h2" style={s.title}>{sv.name}</Text>
        <View style={s.tags}>
          <Pill small tone="blue" icon={doc ? "file-text" : "briefcase"} label={t(doc ? "svh.doc" : "svh.service")} />
          {sv.advokatRequired ? <Pill small tone="warn" icon="shield" label={t("svh.advocate")} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  tile: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  img: { width: 52, height: 52 },
  text: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontSize: 22, lineHeight: 28 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
});
