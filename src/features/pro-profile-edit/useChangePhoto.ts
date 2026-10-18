import { useState } from "react";
import { useSaveAccount } from "@/entities/pro-profile";
import { pickImages } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { toAvatarDataUrl } from "./avatar";

// Gallery or camera → scaled data URL → PUT /clients/me { avatar_url }. "" removes the photo.
export function useChangePhoto() {
  const { t } = useT();
  const save = useSaveAccount();
  const [busy, setBusy] = useState(false);
  const run = async (camera: boolean) => {
    const r = await pickImages({ camera, maxMb: 20, exts: /\.(jpe?g|png|webp|heic)$/i });
    if (!r) return;
    if (r.error || !r.files[0]) return toast(t(r.error === "tooBig" ? "sl5.photo.tooBig" : "sl5.photo.badType"), "err");
    setBusy(true);
    try {
      await save.mutateAsync({ avatarUrl: await toAvatarDataUrl(r.files[0].uri) });
    } catch (e) {
      if (!(e instanceof Error) || /decode|surface/.test(e.message)) toast(t("sl5.photo.failed"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { busy: busy || save.isPending, pick: (camera: boolean) => void run(camera), remove: () => save.mutate({ avatarUrl: "" }) };
}
