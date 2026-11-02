import { useCallback, useRef } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, EmptyState } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel/Notice";
import { useT } from "@/shared/i18n";
import { gateText, isPlanCode } from "../lib/gate";
import { dsetKeys } from "../model/queries";
import type { ModeGate } from "../model/types";
import { DIGITAL_SALES } from "@/shared/store-rules";

type Props = { gate: ModeGate; onPlan: () => void; onBack?: () => void; inline?: boolean };

// Why a document service cannot be used now (TZ.md §4): switched off by the platform, or outside this account's plan — in plain
// words, with the way out (a plan, or back). `inline` is the note inside a card or a sheet. While it shows, the settings are read
// again on every return to its screen, so a plan bought meanwhile opens the service without a restart.
export function ModeNotice({ gate, onPlan, onBack, inline }: Props) {
  const { t } = useT();
  useRecheck();
  const plan = isPlanCode(gate.code);
  const offer = plan && DIGITAL_SALES; // iOS offers no plans (store-rules)
  const icon = gate.state === "off" ? "slash" : "lock";
  const title = gate.state === "off" ? t("dset.offTitle") : plan ? t("dm9.planTitle") : t("dset.closedTitle");
  if (inline) {
    return (
      <View style={{ gap: 8 }}>
        <Notice tone="warn" icon={icon} title={title} text={gateText(t, gate)} />
        {offer ? <Button title={t("dm9.choosePlan")} icon="award" variant="soft" size="sm" full onPress={onPlan} /> : null}
      </View>
    );
  }
  return <EmptyState icon={icon} title={title} text={gateText(t, gate)} actionLabel={offer ? t("dm9.choosePlan") : onBack ? t("common.back") : undefined} onAction={offer ? onPlan : onBack} />;
}

// The first focus is the mount itself (the settings were just read); every later one asks again.
function useRecheck() {
  const qc = useQueryClient();
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      void qc.invalidateQueries({ queryKey: dsetKeys.runtime }, { cancelRefetch: false });
    }, [qc]),
  );
}
