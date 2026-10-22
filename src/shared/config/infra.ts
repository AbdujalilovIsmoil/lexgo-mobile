// INFRA switches, read once from EXPO_PUBLIC_* (empty / unset = the default below).
const on = (v: string | undefined, fallback: boolean): boolean => (v ? /^(1|true|on|yes)$/i.test(v.trim()) : fallback);

// No analytics sink exists yet: events stay in a ring buffer unless a transport is set.
export const ANALYTICS_DEFAULT_ON = on(process.env.EXPO_PUBLIC_ANALYTICS, true);

// Hosts whose https links open inside the app (app.json: associatedDomains / intentFilters).
export const LINK_HOSTS: readonly string[] = ["lexgo.uz", "www.lexgo.uz"];
export const LINK_SCHEME = "lexgo";
