import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// Copy the code/link and open the system share sheet with the invitation text.
export function useShareReferral() {
  const { t } = useT();
  const copy = async (text: string) => {
    if (!text) return;
    selectHaptic();
    await Clipboard.setStringAsync(text);
    toast(t("adm.copied"), "ok");
  };
  const share = async (link: string) => {
    if (!link) return;
    selectHaptic();
    await Share.share({ message: `${t("py7.ref.shareText")} ${link}`, url: link }).catch(() => undefined);
  };
  return { copy, share };
}
