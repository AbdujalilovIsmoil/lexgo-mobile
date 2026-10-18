import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { StatusBadge } from "@/entities/my-document";
import type { DutyResult, ExistingRef } from "@/entities/duty-request";
import { OutcomeCard } from "./OutcomeCard";

type Open = { onOpen: (docId: string) => void; onList: () => void };

// Created: the request is with the call-center pool — unless the fee gate is open, then it is NOT with the advocates yet.
export function SentCard({ r, onOpen, onList }: { r: DutyResult } & Open) {
  const { t } = useT();
  const wait = r.paymentRequired;
  return (
    <OutcomeCard icon={wait ? "clock" : "check-circle"} tone={wait ? "warn" : "ok"} title={wait ? t("dm9.gateTitle") : t("dm9.sentTitle")} text={r.message || (wait ? t("dm9.gateText") : t("dm9.sentText"))}>
      {r.workId ? <Text variant="small" weight="bold" selectable>{r.workId}</Text> : null}
      {wait && r.gate?.amount ? <Text variant="h4">{fmtMoney(r.gate.amount)} {t("adm.currency")}{r.gate.pageCount ? ` · ${t("dm9.pages", { n: r.gate.pageCount })}` : ""}</Text> : null}
      <View style={{ alignSelf: "stretch", gap: 8, marginTop: 8 }}>
        {r.docId ? <Button title={t("dm9.openDoc")} icon="file-text" full onPress={() => onOpen(r.docId)} /> : null}
        <Button title={t("dm9.toList")} variant="soft" full onPress={onList} />
      </View>
    </OutcomeCard>
  );
}

// 409 document_lawyer_request_already_open: show the request that already exists, send nothing new.
export function ExistingCard({ e, onOpen, onList }: { e: ExistingRef } & Open) {
  const { t } = useT();
  return (
    <OutcomeCard icon="info" tone="accent" title={t("dm9.existsTitle")} text={e.message || t("dm9.existsText")}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {e.workId ? <Text variant="small" weight="bold" selectable>{e.workId}</Text> : null}
        {e.status ? <StatusBadge status={e.status} /> : null}
      </View>
      <View style={{ alignSelf: "stretch", gap: 8, marginTop: 8 }}>
        {e.id ? <Button title={t("dm9.openExisting")} icon="file-text" full onPress={() => onOpen(e.id)} /> : null}
        <Button title={t("dm9.toList")} variant="soft" full onPress={onList} />
      </View>
    </OutcomeCard>
  );
}

// 402: the plan does not cover advocate requests.
export function PlanCard({ message, onChoose, onBack }: { message: string; onChoose: () => void; onBack: () => void }) {
  const { t } = useT();
  return (
    <OutcomeCard icon="lock" tone="warn" title={t("dm9.planTitle")} text={message}>
      <View style={{ alignSelf: "stretch", gap: 8, marginTop: 8 }}>
        <Button title={t("dm9.choosePlan")} icon="award" full onPress={onChoose} />
        <Button title={t("dm9.backToForm")} variant="soft" full onPress={onBack} />
      </View>
    </OutcomeCard>
  );
}
