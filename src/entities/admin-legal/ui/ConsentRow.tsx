import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { UserConsent } from "../model/types";
import { useSlugName } from "./DocSlotRow";

// One acceptance in the journal: the document, version badge, who accepted it (short id), IP and when.
export function ConsentRow({ item }: { item: UserConsent }) {
  const { locale } = useT();
  const c = useColors();
  const name = useSlugName();
  return (
    <CcTicket
      tint={c.ok} icon="check-circle" title={name(item.slug || "—")} subtitle={fmtDateTime(item.acceptedAt, locale)}
      badge={<Pill small tone="blue" label={`v${item.version}`} />}
      chips={<>
        <Pill small tone="gray" icon="user" label={`${item.userId.slice(0, 8)}…`} />
        {item.ip ? <Pill small tone="gray" icon="globe" label={item.ip} /> : null}
      </>}
    />
  );
}
