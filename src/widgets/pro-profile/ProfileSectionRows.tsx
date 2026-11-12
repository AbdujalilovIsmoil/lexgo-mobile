import { Award, Briefcase, Layers, MapPin, TrendingUp, User } from "lucide-react-native";
import { isAdvocate, regionKeyOf, type ProProfile, type SectionKey } from "@/entities/pro-profile";
import { ProfileList } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

type Props = { profile: ProProfile; name: string; email: string; done: Record<SectionKey, boolean>; onOpen: (k: "personal" | "license" | "experience" | "directions" | "region") => void; first?: number };

// The editable parts of the profile with a one-line summary each (the client profile's rows: icon tile, title, line, chevron); every row
// opens its form sheet. A part not filled in yet carries the orange dot. `first`: the tile colour the first row takes.
export function ProfileSectionRows({ profile: p, name, email, done, onOpen, first = 0 }: Props) {
  const { t } = useT();
  const join = (...a: (string | number)[]) => a.filter((x) => x !== "" && x !== 0).join(" · ");
  const adv = isAdvocate(p.sellerType);
  const rows = [
    { key: "personal" as const, icon: User, ok: done.personal, sub: join(name, email, p.languages.length ? t("sl5.nLangs", { n: p.languages.length }) : "") },
    { key: "license" as const, icon: Award, ok: done.license && done.organization, sub: join(adv ? p.licenseNumber : "", adv ? p.barAssociation : "", p.organizationName, p.education) },
    { key: "directions" as const, icon: Layers, ok: p.specializations.length > 0 && !!p.bio, sub: join(p.specializations.length ? t("sl5.nDirs", { n: p.specializations.length }) : "", p.bio) },
    { key: "experience" as const, icon: TrendingUp, ok: done.experience, sub: join(p.experienceYears + p.lawyerExperienceYears ? t("sl5.nYears", { n: Math.max(p.experienceYears, p.lawyerExperienceYears) }) : "", p.totalCases ? t("sl5.nCases", { n: p.totalCases }) : "") },
    { key: "region" as const, icon: MapPin, ok: done.region, sub: join(p.region ? t(`lawyers.regions.${regionKeyOf(p.region)}`) : "", p.district) },
  ];
  return (
    <ProfileList
      title={t("profile.pp.sections")}
      first={first}
      rows={[
        { key: "kind", icon: Briefcase, title: t("sl4.kind"), sub: t(`sl1.kind.${p.sellerType || "yurist"}`) },
        ...rows.map((r) => ({ key: r.key, icon: r.icon, title: t(`sl4.${r.key}.title`), sub: r.sub || t("sl4.empty"), warn: !r.ok, onPress: () => onOpen(r.key) })),
      ]}
    />
  );
}
