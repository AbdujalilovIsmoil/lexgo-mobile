import type { BannerCheck } from "../model/types";

export const BANNER_MAX_MB = 12;
/** A link the server can fetch: https, a host with a dot, no spaces. */
export const isBannerUrl = (v: string): boolean => /^https:\/\/[^\s.]+\.\S+$/i.test(v.trim());

/** What keeps a banner request from being sent: nothing (null), or the one reason to tell the seller. */
export type BannerBlock = "needed" | "uploading" | "review" | "badUrl";

type State = { required: boolean; accepts: boolean; url: string; fileUrl: string; check: BannerCheck | null; uploading: boolean };

// The picture is optional unless the package requires it; an uploaded file must pass the check, a link must look like one.
export function bannerBlock(s: State): BannerBlock | null {
  if (!s.accepts) return null;
  if (s.uploading) return "uploading";
  if (s.url.trim() && !isBannerUrl(s.url)) return "badUrl";
  if (s.fileUrl && s.check?.status !== "active") return "review";
  if (s.required && !s.fileUrl && !s.url.trim()) return "needed";
  return null;
}
