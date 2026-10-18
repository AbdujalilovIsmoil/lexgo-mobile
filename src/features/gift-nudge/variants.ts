import type { ComponentProps } from "react";
import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Glyph = ComponentProps<typeof MaterialCommunityIcons>["name"];
export type NudgeVariant = { key: string; glyph: Glyph; colors: [string, string]; href: string; hideForPlan?: string[] };

// Same four messages as the web GiftNudge (giftn__ic--*): gift = orange→rose, Pro = gold crown,
// Lite = teal gem, lawyers = blue. An upsell for a plan the client already has is skipped.
export const NUDGES: NudgeVariant[] = [
  { key: "gift", glyph: "gift", colors: ["#FB923C", "#F43F5E"], href: "/profile/gifts" },
  { key: "pro", glyph: "crown", colors: ["#FFE9B8", "#F5A623"], href: "/subscription", hideForPlan: ["lexgo-ai-pro"] },
  { key: "lite", glyph: "diamond-stone", colors: ["#5EEAD4", "#0D9488"], href: "/subscription", hideForPlan: ["lexgo-ai-lite", "lexgo-ai-pro"] },
  { key: "lawyers", glyph: "account-group", colors: ["#5CA8FF", "#1668F0"], href: "/lawyers" },
];

export const AI_SLUG = /^lexgo-ai-(free|lite|pro)$/;
