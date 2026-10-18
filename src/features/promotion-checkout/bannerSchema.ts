import { z } from "zod";
import { isBannerUrl } from "@/entities/promotion";
import * as rules from "@/shared/form/rules";

// Only https links are accepted (TZ 40); an empty link is fine.
const link = (ok: (v: string) => boolean, message: string) => z.string().refine((v) => !v.trim() || ok(v), message);

// Optional banner content of the promotion wizard (the wizard keeps the values; this is the single rule set).
export const bannerSchema = z.object({
  imageUrl: link(isBannerUrl, "promoSeller.ck.badUrl"),
  title: rules.optText(60),
  subtitle: rules.optText(100),
  ctaLabel: rules.optText(24),
  ctaUrl: link((v) => /^https:\/\/[^\s]+$/i.test(v.trim()), "sl11.banner.httpsOnly"),
});

type Fields = keyof z.infer<typeof bannerSchema>;
/** Message key per invalid field of a banner ({} when it is valid). */
export function bannerErrors(b: Record<Fields, string>): Partial<Record<Fields, string>> {
  const r = bannerSchema.safeParse(b);
  if (r.success) return {};
  return Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]));
}
