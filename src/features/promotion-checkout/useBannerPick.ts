import { useState } from "react";
import { useUploadBanner } from "@/entities/promotion";
import { pickImages } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Banner = { imageUrl: string; fileUrl: string; localUri: string; title: string; subtitle: string; ctaLabel: string; ctaUrl: string };
export const NO_BANNER: Banner = { imageUrl: "", fileUrl: "", localUri: "", title: "", subtitle: "", ctaLabel: "", ctaUrl: "" };

// Gallery picture → POST /promotions/banner-assets (multipart) → the stored file's URL.
export function useBannerPick(onUploaded: (patch: Partial<Banner>) => void) {
  const { t } = useT();
  const up = useUploadBanner();
  const [busy, setBusy] = useState(false);
  const pick = async () => {
    const r = await pickImages({ maxMb: 10, exts: /\.(jpe?g|png|webp|heic)$/i });
    if (!r) return;
    const f = r.files[0];
    if (r.error || !f) return toast(t(r.error === "tooBig" ? "sl11.banner.tooBig" : "sl11.banner.badType"), "err");
    setBusy(true);
    try {
      const url = await up.mutateAsync({ uri: f.uri, name: f.name });
      if (!url) throw new Error("no url");
      onUploaded({ fileUrl: url, localUri: f.uri, imageUrl: "" });
    } catch {
      toast(t("sl11.banner.failed"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { busy, pick: () => void pick() };
}
