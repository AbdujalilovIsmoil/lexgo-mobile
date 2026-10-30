import { usePathname } from "expo-router";
import { GiftNudge } from "@/features/gift-nudge";
import { SupportMenu } from "@/features/support-menu";
import { registerHeaderExtra, registerHeaderRight } from "@/shared/ui/headerExtra";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// The client's banner under the page header shows only where its message fits the page — nowhere else: the gift offer on the profile
// and the academy, the plans on payments, packages and entitlements, the specialists directory after the problem analysis and the
// matches. Every other screen (lists, forms, chats, documents…) keeps its content first.
const PLACES: [RegExp, string][] = [
  [/^\/(m\/)?profile$/, "gift"],
  [/^\/academy$/, "gift"],
  [/^\/payments$/, "pro"],
  [/^\/packages$/, "pro"],
  [/^\/entitlements$/, "pro"],
  [/^\/intake$/, "lawyers"],
  [/^\/matches$/, "lawyers"],
];

function NudgeSlot() {
  const path = usePathname();
  const client = useTabRole() === "client";
  const place = PLACES.find(([re]) => re.test(path))?.[1] ?? "";
  return <GiftNudge enabled={client && !!place} only={place} />;
}

function SupportSlot({ glass }: { glass?: boolean }) {
  const role = useTabRole();
  return role === "client" || role === "seller" ? <SupportMenu glass={glass} client={role === "client"} /> : null;
}

registerHeaderExtra(NudgeSlot);
registerHeaderRight(SupportSlot);
