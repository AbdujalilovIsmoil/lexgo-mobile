import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { ActivityRow, PendingInfo, ProofDoc, RegProfile, RegUser, VerifyItem } from "../model/types";

export function normPending(v: unknown): PendingInfo {
  const d = asDict(v);
  return {
    name: [asStr(d.last_name), asStr(d.first_name), asStr(d.middle_name)].filter(Boolean).join(" ") || asStr(d.name),
    region: asStr(d.region),
    phone: asStr(d.phone),
    status: asStr(d.status),
    attempts: asNum(d.attempts),
    blockedUntil: asStr(d.blocked_until),
    expiresAt: asStr(d.expires_at),
  };
}

export function normUser(v: unknown): RegUser {
  const d = asDict(v);
  return { id: asStr(d.id), lexgoId: asStr(d.lexgo_id), name: asStr(d.name), role: asStr(d.role), accountStatus: asStr(d.account_status), createdAt: asStr(d.created_at) };
}

export function normProfile(v: unknown): RegProfile {
  const d = asDict(v);
  const status = asStr(d.verification_status).toLowerCase();
  return {
    region: asStr(d.region),
    specializations: asArr(d.specializations).map((s) => asStr(s)).filter(Boolean),
    experienceYears: asNum(d.experience_years),
    verified: d.is_verified === true || d.verified === true || status === "verified" || status === "approved",
  };
}

export const normDoc = (v: unknown): ProofDoc => {
  const d = asDict(v);
  return { id: asStr(d.id), kind: asStr(d.kind ?? d.document_type ?? d.type), createdAt: asStr(d.created_at) };
};

// The live backend names a check by `check_type` (key/label are optional extras).
export function normVerifyItem(v: unknown): VerifyItem {
  const d = asDict(v);
  const key = asStr(d.key ?? d.code ?? d.check_type);
  return { key, label: asStr(d.label ?? d.title) || key, status: asStr(d.status), note: asStr(d.note ?? d.detail) };
}

export function normActivity(v: unknown): ActivityRow {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    action: asStr(d.action ?? d.type ?? d.event),
    detail: asStr(d.detail ?? d.description ?? d.message),
    titleUz: asStr(d.title_uz),
    descriptionUz: asStr(d.description_uz),
    createdAt: asStr(d.created_at ?? d.timestamp),
  };
}
