// Every query of the security screen starts with "security": one invalidate refreshes the screen.
export const secKeys = {
  all: ["security"] as const,
  profile: ["security", "profile"] as const,
  sessions: ["security", "sessions"] as const,
  events: ["security", "events"] as const,
  activity: ["security", "activity"] as const,
  prefs: ["security", "prefs"] as const,
};
