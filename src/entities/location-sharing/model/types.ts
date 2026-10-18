export type SharingPolicy = { foregroundIntervalSec: number; backgroundIntervalSec: number; staleAfterSec: number; retentionDays: number };
export type SharingResult = { enabled: boolean; durationHours: number | null; expiresAt: string; updatedAt: string; policy: SharingPolicy };
export type Fix = { latitude: number; longitude: number; accuracy: number | null; at: number };
export type ShareMode = "unknown" | "off" | "on" | "starting" | "stopping";
export type LocErrorKind = "denied" | "unavailable" | "timeout" | "server" | "build";
export type LocError = { kind: LocErrorKind; stop?: boolean };
