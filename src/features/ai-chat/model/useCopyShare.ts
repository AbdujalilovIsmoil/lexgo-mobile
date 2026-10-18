import { useCallback } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { plainText } from "@/entities/chat";
import { useT } from "@/shared/i18n";
import { tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// Copy keeps the answer's markdown; share sends it as plain text (never logged).
export function useCopyShare() {
  const { t } = useT();
  const copy = useCallback(
    async (content: string) => {
      tapHaptic();
      await Clipboard.setStringAsync(content);
      toast(t("ax1.copied"), "ok");
    },
    [t],
  );
  const share = useCallback((content: string) => void Share.share({ message: plainText(content) }).catch(() => {}), []);
  return { copy, share };
}
