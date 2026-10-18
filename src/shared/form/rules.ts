import { z } from "zod";
import { normPhone, splitPhone } from "@/shared/lib/phone";

// Validation rules shared by every form. A message is an i18n key ("ntd.val.…"), optionally "key|n" for the number in
// it; FormInput translates it, so a schema never holds a sentence in one language.
export const m = (key: string, n?: number): string => (n === undefined ? `ntd.val.${key}` : `ntd.val.${key}|${n}`);

/** Required text of at least `min` characters (spaces around do not count), at most `max`. */
export const text = (min: number, max = 4000) => z.string().trim().min(1, m("required")).min(min, m("min", min)).max(max, m("max", max));
/** Optional text: empty is fine, anything typed must be at most `max`. */
export const optText = (max = 4000) => z.string().trim().max(max, m("max", max));
/** A person's name: letters, spaces, apostrophes and hyphens (Latin and Cyrillic), 2–80 characters. */
export const personName = z.string().trim().min(1, m("required")).min(2, m("min", 2)).max(80, m("max", 80)).regex(/^[\p{L}\p{M}'’ʻ`\- .]+$/u, m("nameChars"));
/** Required phone number with its country code (Uzbek: 9 local digits, any way of writing it). */
export const phone = z.string().refine((v) => !!normPhone(v), m("phone"));
/** Optional number: nothing or just the "+dial " prefix is fine, otherwise it must be complete. */
export const optPhone = z.string().refine((v) => !splitPhone(v).national || !!normPhone(v), m("phone"));
/** Optional e-mail. */
export const optEmail = z.string().trim().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), m("email"));
/** Card expiry "MM/YY": a real month and not in the past. */
export const cardExpiry = z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, m("expiry")).refine((v) => {
  const [mm, yy] = v.split("/").map(Number);
  const now = new Date();
  return 2000 + yy > now.getFullYear() || (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1);
}, m("expiryPast"));
/** The last four digits of a card. */
export const last4 = z.string().regex(/^\d{4}$/, m("last4"));
/** A choice that must be made. */
export const pick = z.string().min(1, m("pick"));

/** "Why?" — a reason a person has to give in their own words (refund, warranty …): 10–1000 characters. */
export const reason = z.object({ reason: text(10, 1000) });
/** A note that may stay empty. */
export const note = z.object({ reason: optText(1000) });

/** A whole number typed as text (digits only), within [min, max]. Required. */
export const intText = (min = 0, max = 1_000_000_000) => z.string().trim().min(1, m("required")).regex(/^\d+$/, m("digits")).refine((v) => Number(v) >= min && Number(v) <= max, m("range", min));
/** The same, but empty is fine. */
export const optIntText = (min = 0, max = 1_000_000_000) => z.string().trim().refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max), m("digits"));
/** A decimal number typed as text (dot or comma), >= min. Required. */
export const numText = (min = 0) => z.string().trim().min(1, m("required")).refine((v) => { const n = Number(v.replace(",", ".")); return Number.isFinite(n) && n >= min; }, m("number"));
/** An http(s) link. Required. */
export const url = z.string().trim().min(1, m("required")).regex(/^https?:\/\/\S+\.\S+/i, m("url"));
/** An optional http(s) link. */
export const optUrl = z.string().trim().refine((v) => !v || /^https?:\/\/\S+\.\S+/i.test(v), m("url"));
/** "HH:MM" 24-hour time. */
export const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, m("time"));
/** "YYYY-MM-DD" date. */
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, m("date"));
/** A short code / slug: latin letters, digits, dash, underscore, dot. */
export const slug = z.string().trim().min(1, m("required")).regex(/^[A-Za-z0-9._-]+$/, m("slug"));
