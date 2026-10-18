import * as ImagePicker from "expo-image-picker";
import { CHAT_EXTS, MAX_MB, type PickedFile } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";
import { pickDocuments, pickImages } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";

export type AttachKind = "photo" | "camera" | "file";
const MANY = 6; // photos / documents sent together in one go

// Picks documents / gallery photos / a camera photo, validates size and extension (TZ 40) and hands each file
// over; explains every refusal with a toast.
export function useAttach(onFile: (f: PickedFile) => void) {
  const { t } = useT();
  return async (kind: AttachKind) => {
    try {
      if (kind === "camera" && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return toast(t("admChat.cameraDenied"), "err");
      const res = kind === "file" ? await pickDocuments({ maxMb: MAX_MB, exts: CHAT_EXTS, multiple: true }) : await pickImages({ camera: kind === "camera", maxMb: MAX_MB, multiple: true });
      if (!res) return;
      if (res.error) toast(res.error === "tooBig" ? t("admChat.tooBig", { mb: MAX_MB }) : t("ms3.badType"), "err");
      else res.files.slice(0, MANY).forEach(onFile);
    } catch {
      toast(t("admChat.pickFailed"), "err");
    }
  };
}
