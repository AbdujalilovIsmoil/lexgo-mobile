import { useUploadBanner, BANNER_MAX_MB, type BannerCheck } from "@/entities/promotion";
import { ApiError } from "@/shared/api";
import { pickImages } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Banner = {
  imageUrl: string; // https link typed by the seller
  fileUrl: string; // stored file of an uploaded picture
  localUri: string; // preview of the uploaded picture ("" for HEIC, which the phone cannot always draw)
  fileName: string;
  check: BannerCheck | null; // the server's verdict on the uploaded picture
  uploading: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
};
export const NO_BANNER: Banner = { imageUrl: "", fileUrl: "", localUri: "", fileName: "", check: null, uploading: false, title: "", subtitle: "", ctaLabel: "", ctaUrl: "" };
/** Patch that removes the picture (file or link) but keeps the texts. */
export const NO_PICTURE: Partial<Banner> = { imageUrl: "", fileUrl: "", localUri: "", fileName: "", check: null };

// Gallery picture → POST /promotions/banner-assets (multipart) → stored file + the picture check (active · manual review · rejected).
export function useBannerPick(onChange: (patch: Partial<Banner>) => void) {
  const { t } = useT();
  const up = useUploadBanner();
  const pick = async () => {
    const r = await pickImages({ maxMb: BANNER_MAX_MB, exts: /\.(jpe?g|png|webp|heic)$/i });
    if (!r) return;
    const f = r.files[0];
    if (r.error || !f) return toast(r.error === "tooBig" ? t("promoSeller.ck.bannerTooBig", { mb: BANNER_MAX_MB }) : t("promoSeller.ck.bannerType"), "err");
    onChange({ ...NO_PICTURE, uploading: true, fileName: f.name, localUri: /\.heic$/i.test(f.name) ? "" : f.uri });
    try {
      const check = await up.mutateAsync({ uri: f.uri, name: f.name });
      if (!check.fileUrl) throw new Error("no url");
      onChange({ uploading: false, fileUrl: check.fileUrl, check });
    } catch (e) {
      onChange({ ...NO_PICTURE, uploading: false });
      toast(e instanceof ApiError && e.detail ? e.detail : t("promoSeller.ck.bannerUploadError"), "err");
    }
  };
  return { pick: () => void pick() };
}
