import { SubscriptionPage } from "@/pages/subscription/SubscriptionPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  return <DigitalOnly><SubscriptionPage /></DigitalOnly>;
}
