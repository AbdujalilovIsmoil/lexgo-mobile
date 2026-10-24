// Backend origin. The web app proxies through /api/backend; the mobile app
// talks to the backend directly, so this must be an absolute origin.
const fallback = "https://lexgo.api.cognilabs.org";

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || fallback).replace(/\/+$/, "");

export const WS_BASE = API_BASE.replace(/^http/, "ws");

/**
 * The URL is on our API itself — the API origin followed by nothing, "/", "?" or "#" — so it may carry the bearer token. A prefix test alone
 * also matched "https://lexgo.api.cognilabs.org.evil.tld/…" and "https://lexgo.api.cognilabs.org@evil.tld/…".
 */
export const isApiUrl = (url: string): boolean => url === API_BASE || ["/", "?", "#"].some((c) => url.startsWith(API_BASE + c));

// Payment provider for invoices (POST /payments). Same switch as the website's
// NEXT_PUBLIC_PAYMENT_PROVIDER; "payme" and "click" answer 503 until connected.
export const PAYMENT_PROVIDER = (process.env.EXPO_PUBLIC_PAYMENT_PROVIDER || "payme").trim().toLowerCase();

export const APP_NAME = "LexGo";

export const SUPPORT_PHONE = "+998 78 777 00 00";
