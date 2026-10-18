import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { Section } from "@/entities/pro-profile";
import { Card, Pill, Text, ListRow } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const ICON = { personal: "user", kind: "briefcase", license: "award", experience: "trending-up", region: "map-pin", organization: "home" } as const;

// The profile parts TZ 31 asks for (personal data · kind · licence/diploma · experience · region · organization);
// a compact list, each row opens the matching form on the profile screen.
export function ProfileSections({ sections, percent }: { sections: Section[]; percent: number }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4" style={s.title}>{t("sl2.sectionsTitle")}</Text>
        <Pill label={`${percent}%`} tone={percent >= 100 ? "ok" : "warn"} small />
      </View>
      {sections.map((sec) => (
        <ListRow
          key={sec.key}
          icon={ICON[sec.key]}
          iconTone={sec.done ? "ok" : "warn"}
          title={t(`sl2.sections.${sec.key}`)}
          sub={sec.done ? undefined : sec.missing.map((m) => t(`sl5.missing.${m}`)).join(", ")}
          right={<Pill label={sec.done ? t("sl2.sectionDone") : t("onbUx.sectionLeft", { n: sec.missing.length })} tone={sec.done ? "ok" : "warn"} small />}
          onPress={() => router.push({ pathname: "/pro/profile", params: { section: sec.key } } as never)}
        />
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 0, paddingVertical: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingBottom: 4 },
  title: { flex: 1 },
});
