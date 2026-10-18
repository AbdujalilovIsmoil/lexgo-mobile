import { BottomSheet, SheetScroll } from "@/shared/ui";
import { isApprovalFree, useObject, useStudioAccess, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { useKept } from "@/shared/lib/useKept";
import { ApprovalBody } from "./ApprovalBody";
import { DecisionBar } from "./DecisionBar";
import { canActOnStep, canPublishItem, currentStepOf, isReviewable, normRole } from "./helpers";

// A piece of work from the queue: everything to decide on, with the decision buttons pinned below.
export function ApprovalSheet({ item, onClose }: { item: StudioDetail | null; onClose: () => void }) {
  const { t, role, ctorName } = useStudioText();
  const a = useStudioAccess();
  const base = useKept(item);
  const fresh = useObject(item?.id ?? "").data;
  const d: StudioDetail | null = base && fresh && fresh.id === base.id ? { ...base, ...fresh, title: fresh.title || base.title, raw: { ...base.raw, ...fresh.raw }, payload: Object.keys(fresh.payload).length ? fresh.payload : base.payload, versions: fresh.versions.length ? fresh.versions : base.versions, steps: fresh.steps.length ? fresh.steps : base.steps } : base;
  const ctor = d ? a.constructors.find((c) => c.code === d.code) ?? null : null;
  const at = d ? currentStepOf(d) : null;
  const stepName = at ? at.step.title || role(at.step.role) : "";
  const wait = !d ? "" : isReviewable(d)
    ? t("admStudioC.drawer.waitStep", { step: stepName || t("admStudioC.drawer.nextStep"), role: at?.step.role ? role(normRole(at.step.role)) : t("admStudio.role.studio_reviewer") })
    : t(d.status === "approved" ? "admStudioC.drawer.waitPublisher" : d.status === "changes_requested" ? "admStudioC.drawer.waitAuthor" : d.status === "published" ? "admStudioC.drawer.isPublished" : d.status === "archived" ? "admStudio.flow.archived" : "admStudioC.drawer.notInQueue");
  return (
    <BottomSheet visible={!!item} onClose={onClose} title={d?.title || t("admStudioC.untitled")} subtitle={d ? ctorName(d.code) : undefined} snaps={[0.8, 0.95]}>
      <SheetScroll>{d ? <ApprovalBody d={d} /> : null}</SheetScroll>
      {d ? <DecisionBar id={d.id} canAct={canActOnStep(d, a)} canPub={canPublishItem(d, a, ctor) && !isApprovalFree(d.code, ctor)} wait={wait} stepName={stepName} /> : null}
    </BottomSheet>
  );
}
