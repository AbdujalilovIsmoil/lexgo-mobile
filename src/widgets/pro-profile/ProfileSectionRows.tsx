import { isAdvocate, regionKeyOf, type ProProfile, type SectionKey } from "@/entities/pro-profile";
import { ListRow } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { profile: ProProfile; name: string; email: string; done: Record<SectionKey, boolean>; onOpen: (k: "personal" | "license" | "experience" | "directions" | "region") => void };

// The editable parts of the profile with a one-line summary each; every row opens its form sheet.
export function ProfileSectionRows({ profile: p, name, email, done, onOpen }: Props) {
  const { t } = useT();
  const join = (...a: (string | number)[]) => a.filter((x) => x !== "" && x !== 0).join(" · ");
  const adv = isAdvocate(p.sellerType);
  const rows = [
    { key: "personal" as const, icon: "user" as const, ok: done.personal, sub: join(name, email, p.languages.length ? t("sl5.nLangs", { n: p.languages.length }) : "") },
    { key: "license" as const, icon: "award" as const, ok: done.license && done.organization, sub: join(adv ? p.licenseNumber : "", adv ? p.barAssociation : "", p.organizationName, p.education) },
    { key: "directions" as const, icon: "layers" as const, ok: p.specializations.length > 0 && !!p.bio, sub: join(p.specializations.length ? t("sl5.nDirs", { n: p.specializations.length }) : "", p.bio) },
    { key: "experience" as const, icon: "trending-up" as const, ok: done.experience, sub: join(p.experienceYears + p.lawyerExperienceYears ? t("sl5.nYears", { n: Math.max(p.experienceYears, p.lawyerExperienceYears) }) : "", p.totalCases ? t("sl5.nCases", { n: p.totalCases }) : "") },
    { key: "region" as const, icon: "map-pin" as const, ok: done.region, sub: join(p.region ? t(`lawyers.regions.${regionKeyOf(p.region)}`) : "", p.district) },
  ];
  return (
    <SectionCard padded={false}>
      <ListRow icon="briefcase" iconTone="gray" title={t("sl4.kind")} sub={t(`sl1.kind.${p.sellerType || "yurist"}`)} chevron={false} />
      {rows.map((r) => (
        <ListRow key={r.key} icon={r.icon} iconTone={r.ok ? "blue" : "warn"} title={t(`sl4.${r.key}.title`)} sub={r.sub || t("sl4.empty")} onPress={() => onOpen(r.key)} />
      ))}
    </SectionCard>
  );
}
