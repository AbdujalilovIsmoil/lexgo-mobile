import { http } from "@/shared/api";
import { normAccount, normProfile } from "./normalize";
import type { ProAccount, ProProfile, ProfileFields } from "../model/types";

export const getMyProfile = async (): Promise<ProProfile> => normProfile(await http("/lawyers/me"));

// How clients see this seller; 404 while the profile is not public (pending / unverified).
export const getPublicProfile = async (userId: string): Promise<ProProfile> =>
  normProfile(await http(`/marketplace/lawyers/${encodeURIComponent(userId)}`));

// PUT /lawyers/me replaces the whole record, so the untouched fields are echoed back.
export async function saveProfile(cur: ProProfile, patch: Partial<ProfileFields>): Promise<ProProfile> {
  const f = { ...cur, ...patch };
  const body = {
    seller_type: cur.sellerType || undefined,
    region: f.region,
    district: f.district,
    license_number: f.licenseNumber,
    bar_association: f.barAssociation,
    advocate_structure: f.advocateStructure,
    organization_name: f.organizationName,
    experience_years: Math.max(0, Math.round(f.experienceYears)),
    lawyer_experience_years: Math.max(0, Math.round(f.lawyerExperienceYears)),
    specializations: f.specializations,
    languages: f.languages,
    bio: f.bio,
    education: f.education,
    total_cases: Math.max(0, Math.round(f.totalCases)),
    wins_count: Math.max(0, Math.round(f.winsCount)),
    partial_wins_count: Math.max(0, Math.round(f.partialWinsCount)),
    base_hourly_price: Math.max(0, Math.round(f.hourlyPrice)),
  };
  return normProfile(await http("/lawyers/me", { method: "PUT", body }));
}

export const getAccount = async (): Promise<ProAccount> => normAccount(await http("/clients/me"));

export async function saveAccount(patch: Partial<Pick<ProAccount, "name" | "email" | "avatarUrl">>): Promise<ProAccount> {
  const body: Record<string, string> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.avatarUrl !== undefined) body.avatar_url = patch.avatarUrl;
  return normAccount(await http("/clients/me", { method: "PUT", body }));
}

// POST /lawyers/me/verifications — asks the moderators to (re)check the profile.
export const requestVerification = async (): Promise<void> => {
  await http("/lawyers/me/verifications", { method: "POST", body: { check_type: "manual" } });
};
