import { useServiceOpen, useTemplateDownload } from "@/features/service-open";
import { DocActions, type Service } from "@/entities/service";
import { TemplateGates } from "@/widgets/ai-plan-upgrade";

type Props = { service: Service; navigate: (fn: () => void) => void };

// A document service's four buttons inside a card or a drawer (the catalogue's cards use the same).
export function ServiceDocActions({ service: sv, navigate }: Props) {
  const open = useServiceOpen(navigate);
  const dl = useTemplateDownload();
  return (
    <>
      <DocActions
        hasDoc={!!sv.documentTemplateId}
        advokatOnly={sv.advokatRequired}
        locked={dl.free}
        downloading={dl.busy === sv.id}
        error={dl.error?.id === sv.id ? dl.error.msg : undefined}
        onView={() => open.view(sv.id)}
        onDownload={() => open.guard(() => void dl.download(sv))}
        onLawyer={() => open.lawyer(sv.id)}
        onFill={() => open.fill(sv.id)}
      />
      <TemplateGates gates={dl} />
    </>
  );
}
