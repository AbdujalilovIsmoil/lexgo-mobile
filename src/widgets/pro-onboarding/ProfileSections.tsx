import { useRouter } from "expo-router";
import type { Section } from "@/entities/pro-profile";
import { Icon, ListRow } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON = { personal: "user", kind: "briefcase", license: "award", experience: "trending-up", region: "map-pin", organization: "home" } as const;

// The profile parts TZ 31 asks for (personal data · kind · licence/diploma · experience · region · organization);
// each opens the matching form on the profile screen.
export function ProfileSections({ sections, percent }: { sections: Section[]; percent: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <SectionCard title={`${t("sl2.sectionsTitle")} · ${percent}%`} padded={false}>
      {sections.map((sec) => (
        <ListRow
          key={sec.key}
          icon={ICON[sec.key]}
          iconTone={sec.done ? "ok" : "warn"}
          title={t(`sl2.sections.${sec.key}`)}
          sub={sec.done ? t("sl2.sectionDone") : sec.missing.map((m) => t(`sl5.missing.${m}`)).join(", ")}
          right={<Icon name={sec.done ? "check-circle" : "alert-circle"} size={18} color={sec.done ? c.ok : c.warn} />}
          onPress={() => router.push({ pathname: "/pro/profile", params: { section: sec.key } } as never)}
        />
      ))}
    </SectionCard>
  );
}
