export type TwoFactorMethod = "telegram" | "sms" | "totp" | "";
export type SecurityProfile = { twoFactorEnabled: boolean; method: TwoFactorMethod; telegramLinked?: boolean };
export type OtpStart = { verificationId: string; expiresAt: number }; // expiresAt: epoch ms on the phone clock
export type TotpSetup = { setupId: string; secret: string; otpauthUrl: string; qrCode: string };
export type TelegramLink = { url: string; expiresAt: number; linked: boolean };

export type DeviceSession = { id: string; deviceLabel: string; ip: string; lastUsedAt: string; createdAt: string; expiresAt: string; current?: boolean };
export type SecurityEvent = { id: string; type: string; title: string; status: string; fromIp: string; ip: string; agent: string; createdAt: string };
export type ActivityEntry = { id: string; action: string; detail: string; titleUz: string; descriptionUz: string; ip: string; outcome: string; createdAt: string };

export const NOTIF_KEYS = ["push", "sms", "telegram", "email", "orders", "payments", "messages", "marketing"] as const;
export type NotifKey = (typeof NOTIF_KEYS)[number];
export type NotifPrefs = Record<NotifKey, boolean>;
