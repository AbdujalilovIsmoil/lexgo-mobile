import { usePaymentSync } from "@/features/payments";
import { useRatingSync } from "@/features/rating";
import { RatePromptBanner } from "@/widgets/rating";

// Pay package, app-wide: payments/entitlements/gifts refetch when the user socket says they
// changed, finished work is scanned for an open 15-minute rating window, and the dismissible
// "rate this" banner (tap → /rate/[workId]) is drawn above every screen.
export function PayMounts() {
  usePaymentSync();
  useRatingSync();
  return <RatePromptBanner />;
}
