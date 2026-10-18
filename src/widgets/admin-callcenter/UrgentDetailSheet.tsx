import { useState } from "react";
import { useCcLabel, useUrgentDetail } from "@/entities/admin-callcenter";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { CancelSheet, CompleteSheet, GroupSheet, StatusSheet, TransferSheet } from "@/features/admin-callcenter";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { QueryBoundary } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { UrgentDetails } from "./UrgentDetails";
import { UrgentHead } from "./UrgentHead";
import { UrgentHistory } from "./UrgentHistory";
import { UrgentPeople } from "./UrgentPeople";
import { UrgentSheetActions, type Panel } from "./UrgentSheetActions";

// One urgent request in full. Polls while open so a record another operator moves updates under your thumb.
export function UrgentDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useT();
  const label = useCcLabel();
  const { isFullAdmin } = useAccess();
  const meId = useSession()?.user.id ?? "";
  const shown = useKept(id || null) ?? "";
  const q = useUrgentDetail(shown, !!id);
  const req = q.data;
  const [panel, setPanel] = useState<Panel>("");
  const shut = () => setPanel("");
  return (
    <BottomSheet visible={!!id} onClose={onClose} title={req ? label("admCc.kind", req.serviceKind) || req.serviceTitle : t("adm.details")} subtitle={req?.workId} snaps={[0.74, 0.95]}>
      <SheetScroll>
        <QueryBoundary query={q}>
          {req ? (
            <>
              <UrgentHead req={req} />
              <UrgentSheetActions req={req} meId={meId} admin={isFullAdmin} close={onClose} onPanel={setPanel} />
              <UrgentPeople req={req} />
              <UrgentDetails req={req} />
              <UrgentHistory req={req} />
            </>
          ) : null}
        </QueryBoundary>
      </SheetScroll>
      {req ? (
        <>
          <GroupSheet req={req} visible={panel === "group"} onClose={shut} />
          <CompleteSheet req={req} visible={panel === "complete"} onClose={shut} />
          <TransferSheet req={req} visible={panel === "transfer"} onClose={shut} />
          <CancelSheet req={req} visible={panel === "cancel"} onClose={shut} />
          <StatusSheet req={req} meId={meId} visible={panel === "status"} onClose={shut} />
        </>
      ) : null}
    </BottomSheet>
  );
}
