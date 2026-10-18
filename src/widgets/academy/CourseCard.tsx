import { StyleSheet, View } from "react-native";
import { type AcademyCourse } from "@/entities/academy";
import { brand, radius, useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { course: AcademyCourse; category: string };

const COVERS = [brand.b600, brand.b500, brand.b700, brand.b400];

// One academy course: coloured cover with the level, category, lessons, minutes, progress, disabled CTA.
export function CourseCard({ course, category }: Props) {
  const c = useColors();
  const { t } = useT();
  const level = t(`cpd.academy.level.${course.level}`);
  return (
    <Card padded={false} style={s.card}>
      <View style={[s.cover, { backgroundColor: COVERS[course.title.length % 4] }]}>
        <Pill label={level.startsWith("cpd.") ? course.level : level} tone="glass" small />
      </View>
      <View style={s.body}>
        {category ? <Text variant="caption" tone="accent" weight="bold">{category}</Text> : null}
        <Text variant="h4">{course.title}</Text>
        <View style={s.meta}>
          <Icon name="file-text" size={14} tone="gray" />
          <Text variant="small" tone="gray">{t("cpd.academy.lessons", { n: course.lessons })}</Text>
          <Icon name="clock" size={14} tone="gray" />
          <Text variant="small" tone="gray">{t("cpd.academy.mins", { n: course.durationMin })}</Text>
        </View>
        {course.progress > 0 ? (
          <View style={[s.track, { backgroundColor: c.surface2 }]}><View style={[s.bar, { width: `${Math.min(course.progress, 100)}%`, backgroundColor: c.accent }]} /></View>
        ) : null}
        <Button title={t("cpd.academy.soon")} variant="soft" size="sm" full disabled />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { overflow: "hidden" },
  cover: { height: 84, padding: 12, alignItems: "flex-start" },
  body: { padding: 16, gap: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  track: { height: 6, borderRadius: radius.pill, overflow: "hidden" },
  bar: { height: 6 },
});
