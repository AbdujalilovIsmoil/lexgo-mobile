import { useServiceOpen, useTemplateDownload } from "@/features/service-open";
import { DocActions, type Service } from "@/entities/service";
import { useDocSettings } from "@/entities/doc-settings";
import { PlanGateSheet } from "@/features/plan-gate";

type Props = { service: Service; navigate: (fn: () => void) => void };

// A document service's four buttons inside a card or a drawer (the catalogue's cards use the same), as the document service settings allow.
export function ServiceDocActions({ service: sv, navigate }: Props) {
  const open = useServiceOpen(navigate);
  const dl = useTemplateDownload();
  const ds = useDocSettings();
  return (
    <>
      <DocActions
        hasDoc={!!sv.documentTemplateId}
        advokatOnly={sv.advokatRequired}
        locked={dl.locked}
        note={dl.note}
        downloading={dl.busy === sv.id}
        error={dl.error?.id === sv.id ? dl.error.msg : undefined}
        ways={{ fill: ds.gate("manual").state, lawyer: ds.gate("lawyer").state }}
        onView={() => open.view(sv.id)}
        onDownload={() => open.guard(() => void dl.download(sv))}
        onLawyer={() => open.lawyer(sv.id)}
        onFill={() => open.fill(sv.id)}
      />
      <PlanGateSheet gate={dl.gate} onClose={dl.closeGate} />
    </>
  );
}
