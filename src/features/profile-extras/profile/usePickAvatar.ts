import { useState } from "react";
import { pickImages } from "@/shared/lib/upload";
import { toAvatarDataUrl } from "@/shared/lib/pay/avatar";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// Photo library picker -> 512px JPEG data URL (what the web PhotoUpload stores as avatar_url).
export function usePickAvatar(onPick: (dataUrl: string) => void) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const choose = async () => {
    setBusy(true);
    try {
      const r = await pickImages({ maxMb: 15, exts: /\.(jpe?g|png|webp|heic)$/i });
      if (r?.error) toast(t(r.error === "tooBig" ? "py9.photoBig" : "py9.photoType"), "err");
      else if (r?.files[0]) onPick(await toAvatarDataUrl(r.files[0].uri));
    } catch {
      toast(t("py9.photoFail"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { busy, choose };
}
