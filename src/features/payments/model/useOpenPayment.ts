import { useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import { safePaymentUrl } from "@/entities/payment";

// Opens the provider's payment page in the in-app browser (https only). When the user comes
// back, `after` re-reads the payment — the page itself never tells the app it was paid.
export function useOpenPayment(after?: () => void): (url: string) => Promise<void> {
  return useCallback(
    async (url: string) => {
      const safe = safePaymentUrl(url);
      if (!safe) return;
      await WebBrowser.openBrowserAsync(safe).catch(() => undefined);
      after?.();
    },
    [after],
  );
}
