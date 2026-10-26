import type { ProAccount, ProProfile } from "../model/types";
import { isAdvocate } from "./catalog";

// Onboarding sections of TZ 31 and the profile fields each needs, plus the photo the marketplace card shows (the web counts it too).
// The organisation part (the advocate's bureau / firm) exists for an advokat only.
export type SectionKey = "personal" | "photo" | "kind" | "license" | "experience" | "region" | "organization";
export type Section = { key: SectionKey; done: boolean; missing: string[] };

const has = (v: string | undefined) => !!v && v.trim().length > 0;

export function sectionsOf(p: ProProfile, account?: Partial<Pick<ProAccount, "name" | "email" | "avatarUrl">>): Section[] {
  const adv = isAdvocate(p.sellerType);
  const mk = (key: SectionKey, checks: [string, boolean][]): Section => {
    const missing = checks.filter(([, ok]) => !ok).map(([f]) => f);
    return { key, done: missing.length === 0, missing };
  };
  const all = [
    mk("personal", [["name", has(account?.name) || has(p.name)], ["email", has(account?.email)], ["languages", p.languages.length > 0]]),
    mk("photo", [["photo", has(account?.avatarUrl)]]),
    mk("kind", [["sellerType", has(p.sellerType)]]),
    mk("license", adv ? [["licenseNumber", has(p.licenseNumber)], ["barAssociation", has(p.barAssociation)], ["education", has(p.education)]] : [["education", has(p.education)]]),
    mk("experience", [["experience", p.experienceYears + p.lawyerExperienceYears > 0], ["directions", p.specializations.length > 0], ["bio", has(p.bio)]]),
    mk("region", [["region", has(p.region)]]),
  ];
  return adv ? [...all, mk("organization", [["structure", has(p.advocateStructure) || has(p.organizationName)]])] : all;
}

export const completeness = (s: Section[]) => (s.length ? Math.round((s.filter((x) => x.done).length / s.length) * 100) : 0);
