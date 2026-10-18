import type { ProProfile } from "../model/types";
import { isAdvocate } from "./catalog";

// Onboarding sections of TZ 31 and the profile fields each needs.
export type SectionKey = "personal" | "kind" | "license" | "experience" | "region" | "organization";
export type Section = { key: SectionKey; done: boolean; missing: string[] };

const has = (v: string) => v.trim().length > 0;

export function sectionsOf(p: ProProfile, accountName: string, accountEmail: string): Section[] {
  const adv = isAdvocate(p.sellerType);
  const mk = (key: SectionKey, checks: [string, boolean][]): Section => {
    const missing = checks.filter(([, ok]) => !ok).map(([f]) => f);
    return { key, done: missing.length === 0, missing };
  };
  return [
    mk("personal", [["name", has(accountName)], ["email", has(accountEmail)], ["languages", p.languages.length > 0]]),
    mk("kind", [["sellerType", has(p.sellerType)]]),
    mk("license", adv ? [["licenseNumber", has(p.licenseNumber)], ["barAssociation", has(p.barAssociation)], ["education", has(p.education)]] : [["education", has(p.education)]]),
    mk("experience", [["experience", p.experienceYears + p.lawyerExperienceYears > 0], ["directions", p.specializations.length > 0], ["bio", has(p.bio)]]),
    mk("region", [["region", has(p.region)]]),
    mk("organization", adv ? [["structure", has(p.advocateStructure) || has(p.organizationName)]] : []),
  ];
}

export const completeness = (s: Section[]) => (s.length ? Math.round((s.filter((x) => x.done).length / s.length) * 100) : 0);
