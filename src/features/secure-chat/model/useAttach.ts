import * as ImagePicker from "expo-image-picker";
import { pickChecked, type PickedFile } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

export type AttachKind = "photo" | "camera" | "file";
const MANY = 6; // photos / documents sent together in one go

// Picks documents / gallery photos / a camera photo and checks each file against the server's rules (allowed types, 50 MB, 200 MB for
// MP4 / MOV) before anything is uploaded. The good ones are handed over; the others are named in a toast with the reason.
export function useAttach(onFile: (f: PickedFile) => void) {
  const { t } = useT();
  return async (kind: AttachKind) => {
    try {
      if (kind === "camera" && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return toast(t("admChat.cameraDenied"), "err");
      const ok = await pickChecked(kind, t);
      ok.slice(0, MANY).forEach(onFile);
      if (ok.length > MANY) toast(t("admChat.tooMany", { n: MANY }), "info");
    } catch {
      toast(t("admChat.pickFailed"), "err");
    }
  };
}
