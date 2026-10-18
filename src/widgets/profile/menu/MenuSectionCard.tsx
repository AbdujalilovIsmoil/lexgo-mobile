import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Divider, ListRow, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { MenuSection } from "./types";

type Props = { section: MenuSection; badges: Record<string, number> };

export function MenuSectionCard({ section, badges }: Props) {
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={s.wrap}>
      <Text variant="kicker" tone="gray2" style={s.kick}>{t(section.label ?? `nav1.section.${section.key}`).toUpperCase()}</Text>
      <Card padded={false} style={s.card}>
        {section.items.map((it, i) => (
          <View key={it.key}>
            {i > 0 ? <Divider inset={66} /> : null}
            <ListRow icon={it.icon} title={t(it.label ?? `nav1.menu.${it.key}`)} onPress={() => router.push(it.route as never)} right={it.badge && badges[it.badge] ? <Pill label={String(badges[it.badge])} tone="cy" small /> : undefined} />
          </View>
        ))}
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 20 },
  kick: { marginBottom: 8, marginLeft: 4 },
  card: { paddingHorizontal: 16 },
});
