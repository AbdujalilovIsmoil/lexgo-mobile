import { useEntitlements, usePlans } from "./queries";

const AI_SLUG = /^lexgo-ai-(free|lite|pro)$/;

// Whether the client is on the free LexGo.AI tier: Lite/Pro download raw templates, Free only views
// them. The client's active subscriptions are matched against the three lexgo-ai-* plans.
export function useIsFreeAiTier(): boolean {
  const ent = useEntitlements().data;
  const plans = usePlans().data;
  const mine = plans?.filter((p) => AI_SLUG.test(p.slug)).find((p) => ent?.planIds.includes(p.id));
  return !mine || mine.slug === "lexgo-ai-free";
}
