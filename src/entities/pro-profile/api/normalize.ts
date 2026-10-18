import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { ProAccount, ProProfile } from "../model/types";

const strs = (v: unknown) => asArr(v).map((x) => asStr(x).trim()).filter(Boolean);
const VERIFIED = /^(approved|verified)$/;

// GET /lawyers/me and GET /marketplace/lawyers/{id} (extra public fields are optional).
export function normProfile(v: unknown): ProProfile {
  const d = asDict(v);
  const badge = asDict(d.verification_badge);
  const avail = asDict(d.availability);
  const status = asStr(d.verification_status).toLowerCase();
  return {
    userId: asStr(d.user_id ?? d.id),
    publicId: asStr(d.public_id),
    name: asStr(d.lawyer_name ?? d.name).trim(),
    sellerType: asStr(d.seller_type).toLowerCase(),
    region: asStr(d.region).trim(),
    district: asStr(d.district).trim(),
    licenseNumber: asStr(d.license_number).trim(),
    barAssociation: asStr(d.bar_association).trim(),
    advocateStructure: asStr(d.advocate_structure).trim(),
    organizationName: asStr(d.organization_name).trim(),
    experienceYears: asNum(d.experience_years),
    lawyerExperienceYears: asNum(d.lawyer_experience_years),
    specializations: strs(d.specializations),
    languages: strs(d.languages),
    bio: asStr(d.bio).trim(),
    education: asStr(d.education).trim(),
    totalCases: asNum(d.total_cases),
    winsCount: asNum(d.wins_count),
    partialWinsCount: asNum(d.partial_wins_count),
    successRate: asNum(d.success_rate),
    hourlyPrice: uzs(d, "base_hourly_price"),
    verificationStatus: status,
    verified: d.is_verified === true || d.lexgo_verified === true || badge.visible === true || VERIFIED.test(status),
    badgeLabel: asStr(badge.label).trim(),
    rating: asNum(d.rating),
    reviewsCount: asNum(d.reviews_count),
    onlineNow: d.online_now === true,
    available: asStr(avail.status, "available") !== "offline",
    serviceTitles: strs(d.service_titles),
    priceFrom: uzs(d, "price_from"),
    priceTo: uzs(d, "price_to"),
  };
}

export function normAccount(v: unknown): ProAccount {
  const d = asDict(v);
  return { name: asStr(d.name).trim(), email: asStr(d.email).trim(), avatarUrl: asStr(d.avatar_url), phone: asStr(d.phone) };
}
