export const ACTIVITY_GROUPS = ["auth", "orders", "documents", "profile", "other"] as const;
export type ActivityGroup = (typeof ACTIVITY_GROUPS)[number];

// Rough grouping of audit actions for the filter chips (same buckets as AccountAudit on the web).
const RULES: [ActivityGroup, RegExp][] = [
  ["auth", /login|logout|session|2fa|two_factor|password|otp|telegram|refresh/i],
  ["orders", /order|milestone|payment|refund|contract|case|subscription|gift/i],
  ["documents", /document|file|template|download|upload/i],
  ["profile", /profile|lawyer|consent|verification|settings|notification/i],
];

export const groupOf = (action: string): ActivityGroup => RULES.find(([, re]) => re.test(action))?.[0] ?? "other";
