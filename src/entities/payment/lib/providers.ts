import { PAYMENT_PROVIDER } from "@/shared/config/env";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";

// Providers tried in order when a checkout is refused because the provider is not
// connected (payme/click answer 503 on staging, atmos works). Config first, then atmos.
export const PROVIDER_LADDER: string[] = [...new Set([PAYMENT_PROVIDER, "atmos"])];

export const safePaymentUrl = safeHttpsUrl;
