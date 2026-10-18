import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { ctorMeta } from "../model/ctorMeta";
import { statusTint } from "../model/statusTint";
import { useStudioText } from "../model/useStudioText";
import type { StudioObject } from "../model/types";
import { StudioStatusPill } from "./StudioStatusPill";

type Props = { item: StudioObject; onPress: () => void; onArchive?: () => void; archiving?: boolean };

// One studio object as a ticket: status strip, title, constructor, version · owner · file · age chips, round archive button.
export function ObjectRow({ item, onPress, onArchive, archiving }: Props) {
  const { t, ctorName } = useStudioText();
  const c = useColors();
  return (
    <CcTicket
      tint={statusTint(c, item.status)}
      icon={ctorMeta(item.code).icon}
      title={item.title || t("admStudio.list.untitled")}
      subtitle={ctorName(item.code)}
      badge={<StudioStatusPill status={item.status} raw={item.statusRaw} />}
      chips={<>
        {item.currentVersion ? <Pill small tone="gray" label={`v${item.currentVersion}`} /> : null}
        {item.createdBy ? <Pill small tone="gray" icon="user" label={item.createdBy} /> : null}
        {item.hasFile ? <Pill small tone="gray" icon="paperclip" label={t("admStudio.list.hasFile")} /> : null}
        <Pill small tone="gray" icon="clock" label={timeAgo(item.updatedAt || item.createdAt, t)} />
      </>}
      actions={onArchive && item.status !== "archived" ? <CcAction icon="archive" label={t("admStudio.actions.archive")} onPress={onArchive} loading={archiving} /> : undefined}
      onPress={onPress}
    />
  );
}
