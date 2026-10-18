import { useMemo } from "react";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pay/tOr";
import { complaintStage, type ComplaintItem, type ComplaintKind, type ComplaintSource, type ComplaintStage } from "./complaint";

const KNOWN = ["new", "pending", "under_review", "rework_required", "rework_in_progress", "resolved", "rejected", "closed", "cancelled"];

// Words for a complaint's status, category, source and the one-line hint (portal.client.complaints).
export function useComplaintLabels() {
  const { t } = useT();
  return useMemo(() => {
    const stage = (s: ComplaintStage) => t(`py5.stage.${s}`);
    return {
      stage,
      kind: (k: ComplaintKind) => t(`py5.kind.${k}`),
      source: (s: ComplaintSource) => (s ? t(`pwc.source.${s}`) : ""),
      category: (c: string) => (c ? tOr(t, "py5.cat", c) : ""),
      tag: (status: string) => {
        if (!KNOWN.includes(status)) return tOr(t, "py5.stage", status) || stage("review");
        const st = complaintStage(status);
        return st === "closed" ? t(`pwc.statuses.${status}`) : stage(st);
      },
      hint: (c: Pick<ComplaintItem, "kind" | "status">) => {
        const st = complaintStage(c.status);
        if (st === "new") return t("pwc.hint.waiting");
        if (st === "review") return t(c.kind === "quality" ? "pwc.hint.review" : "pwc.hint.reviewing");
        return t(`pwc.hint.${st}`);
      },
    };
  }, [t]);
}
