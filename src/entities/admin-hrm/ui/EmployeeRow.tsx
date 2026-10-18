import { memo } from "react";
import { Linking } from "react-native";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { statusColor } from "../lib/tone";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import type { Employee } from "../model/types";

// One employee as a ticket: status strip, name, code · phone, place chip, call button, in-app chat (only for employees with an account) and the 360 view as the primary one.
export const EmployeeRow = memo(function EmployeeRow({ item, place, onPress, onMessage, index }: { item: Employee; place: string; onPress: () => void; onMessage?: (e: Employee) => void; index?: number }) {
  const { t } = useT();
  const ring = (url: string) => () => { tapHaptic(); void Linking.openURL(url).catch(() => undefined); };
  return (
    <Enter index={index}><CcTicket
      tint={statusColor(item.status)} avatar={item.name} title={item.name} subtitle={[item.code, item.phone].filter(Boolean).join(" · ")}
      badge={<HrmStatus status={item.status} />} onPress={onPress}
      chips={place ? <Pill small tone="gray" icon="briefcase" label={place} /> : undefined}
      actions={<>
        {item.phone ? <CcAction icon="phone" label={t("admHrmU.call")} onPress={ring(`tel:${item.phone}`)} /> : null}
        {onMessage && item.userId ? <CcAction icon="message-circle" label={t("admHrmV.chat")} onPress={() => { tapHaptic(); onMessage(item); }} /> : null}
        <CcAction primary icon="user" label={t("admHrmU.open360")} onPress={onPress} />
      </>}
    /></Enter>
  );
});
