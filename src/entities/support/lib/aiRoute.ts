import { mobileRoute } from "@/shared/instructor/routes";

export type AiTarget = { path: string; key: string };

// Label (sp5.routes.<key>) of the screens the instructor most often points to.
const LABELS: [RegExp, string][] = [
  [/^\/subscription/, "plans"], [/^\/payments/, "payments"], [/^\/doc-analysis/, "analysis"], [/^\/services/, "services"],
  [/^\/documents/, "documents"], [/^\/lawyers?(\/|$)/, "lawyers"], [/^\/orders/, "orders"], [/^\/urgent/, "urgent"], [/^\/works/, "works"],
  [/^\/notifications/, "notifications"], [/^\/profile/, "profile"], [/^\/messages/, "messages"], [/^\/ai/, "ai"], [/^\/$/, "home"],
];

/** App screen for a portal href the instructor answered with (the AI package's route table), or null. */
export function appTargetOf(href: string): AiTarget | null {
  const path = mobileRoute(href);
  if (!path || path.startsWith("/support")) return null; // we are already in support
  const hit = LABELS.find(([re]) => re.test(path));
  return { path, key: hit ? hit[1] : "page" };
}
