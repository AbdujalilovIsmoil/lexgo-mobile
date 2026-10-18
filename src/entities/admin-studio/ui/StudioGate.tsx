import type { ReactNode } from "react";
import { View } from "react-native";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { studioAllowed, useStudioAccess, type StudioNeed } from "../model/useStudioAccess";
import { useStudioSync } from "../model/useStudioSync";

// Wraps a studio screen: loading → "not enabled" → server error → "no access" → the screen.
// The blocked states get their own frame (title + back); the screen draws its own AdminPage.
export function StudioGate({ need, title, children }: { need: StudioNeed; title: string; children: ReactNode }) {
  const { t } = useT();
  const a = useStudioAccess();
  useStudioSync();
  const frame = (node: ReactNode) => <AdminPage title={title}>{node}</AdminPage>;
  if (a.avail === "checking") return frame(<View style={{ gap: 12, padding: 16 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={84} round={20} />)}</View>);
  if (a.avail === "off") return frame(<EmptyState icon="cloud-off" title={t("admStudio.off.title")} text={t("admStudio.off.text")} actionLabel={t("admStudio.off.recheck")} onAction={a.reload} />);
  if (a.error && !a.any) return frame(<ErrorView error={a.error} onRetry={a.reload} />);
  if (!studioAllowed(a, need)) return frame(<EmptyState icon="lock" title={t("admStudio.noAccess.title")} text={t("admStudio.noAccess.text")} />);
  return <>{children}</>;
}
