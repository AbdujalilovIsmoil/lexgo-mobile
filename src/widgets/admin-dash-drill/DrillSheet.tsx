import { View } from "react-native";
import { useRouter } from "expo-router";
import { moduleByKey, useAccess } from "@/entities/access";
import type { Drill } from "@/entities/admin-dash";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { Button, Pill, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { DrillDetail } from "./DrillDetail";
import { DrillSectionView } from "./DrillSectionView";

// Bottom sheet behind a stat tile: headline number, breakdown sections, real records and a jump to the module.
export function DrillSheet({ drill: current, onClose }: { drill: Drill | null; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const access = useAccess();
  const drill = useKept(current);
  const mod = drill?.link ? moduleByKey(drill.link.module) : undefined;
  const go = () => {
    onClose();
    if (mod) setTimeout(() => router.push(`/manage/${mod.key}` as never), 320);
  };
  return (
    <FormSheet visible={!!current} onClose={onClose} title={drill?.title ?? ""} snaps={[0.7, 0.94]}>
      {drill ? (
        <>
          {drill.value ? (
            <View style={{ gap: 4 }}>
              <Text variant="h2">{drill.value}</Text>
              {drill.sub ? <Text variant="small" tone="gray">{drill.sub}</Text> : null}
              {drill.demo ? <View style={{ alignSelf: "flex-start" }}><Pill label={t("adm.demo")} tone="warn" small /></View> : null}
            </View>
          ) : null}
          {drill.note ? <Text variant="caption" tone="gray2">{drill.note}</Text> : null}
          {drill.sections.map((s, i) => <DrillSectionView key={i} s={s} />)}
          {drill.detail && !drill.demo ? <DrillDetail detail={drill.detail} /> : null}
          {mod && drill.link && mod.visible(access) ? <Button title={drill.link.label} variant="soft" icon="arrow-right" onPress={go} full /> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
