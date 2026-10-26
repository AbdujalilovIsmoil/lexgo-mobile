export type BackendRole = "client" | "yurist" | "advokat" | string;
export type Role = "client" | "lawyer" | "advocate";

export type User = {
  id: string;
  lexgoId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  region?: string;
  phone: string;
  role: Role;
  backendRole: string;
  accountStatus: string;
  roles: string[]; // assigned roles as the backend sends them; `backendRole` is the primary one
  permissions: string[]; // permission codes (tasks.view …) that open extra sections
  twoFactorEnabled: boolean;
  twoFactorMethod?: string;
  phoneVerified?: boolean;
  telegramLinked?: boolean;
  createdAt?: string;
};

export type Session = {
  user: User;
  token: string;
  refreshToken: string;
  sid?: string; // id of THIS device's row in /auth/sessions, once known (the backend has no "current" flag)
};

export type OtpChallenge = {
  verificationId: string;
  phone: string;
  expiresAt: number; // epoch ms, 0 = unknown
  message: string;
  telegramBotLink?: string;
};

export type TwoFactorChallenge = OtpChallenge & {
  twoFactorRequired: true;
  method: "telegram" | "sms" | "totp" | "";
};

export type LoginResult = Session | TwoFactorChallenge;

// `pending`: a seller registration waiting for an admin (no tokens issued).
export type RegisterVerifyResult =
  | { kind: "session"; session: Session }
  | { kind: "pending"; message: string; status: string; role: string }
  | { kind: "loginRequired"; message: string };

export const isTwoFactor = (r: LoginResult): r is TwoFactorChallenge => "twoFactorRequired" in r;

// The accounts the mobile app serves: a client and the two professionals (UserRole of the API). Organisation, staff, call-centre and
// sales accounts (advokat_tashkiloti, admin, manager, call_center, sales) work in the web panel: the app does not sign them in.
export const MOBILE_ROLES = ["client", "yurist", "advokat"] as const;
export const isMobileAccount = (backendRole: string): boolean => (MOBILE_ROLES as readonly string[]).includes(backendRole);

// UI role ↔ backend role (lib/auth.tsx on the web).
export const fromBackendRole = (r: string): Role => (r === "yurist" ? "lawyer" : r === "advokat" ? "advocate" : "client");
