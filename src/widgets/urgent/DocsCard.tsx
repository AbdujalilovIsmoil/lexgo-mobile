import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheet, Card, Icon, Pill, SheetScroll, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { FeatureTile } from "./FeatureTile";

const FLOWS: { kind: "custom" | "review"; icon: IconName; title: string; sub: string }[] = [
  { kind: "custom", icon: "edit-3", title: "cxUg.scratchTitle", sub: "cxUg.scratchSub" },
  { kind: "review", icon: "clipboard", title: "cxUg.reviewTitle", sub: "cxUg.reviewSub" },
];

// The last box of the list ("Huquqiy hujjatlar bo'yicha ishlash"): not a consultation, so no price or
// channel. It opens a sheet with the two duty-advocate document flows (/documents/new?kind=…).
export function DocsCard() {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const go = (kind: string) => {
    setOpen(false);
    router.push({ pathname: "/documents/new", params: { kind } });
  };
  return (
    <>
      <FeatureTile
        icon="file-text" tint="#5C6E85" title={t("cxUg.docsTitle")} lead={t("cxUg.docsLead")} onPress={() => setOpen(true)}
        pills={<Pill small tone="cy" icon="layers" label={t("ug1.kindsN", { n: FLOWS.length })} />} hintIcon="clock"  hint={t("ntd.ugDelPool")}
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("cxUg.docsTitle")} snaps={[0.5, 0.8]}>
        <SheetScroll>
          <Text variant="small" tone="gray">{t("cxUg.pickLead")}</Text>
          {FLOWS.map((f) => (
            <Card key={f.kind} onPress={() => go(f.kind)} style={s.card}>
              <Icon name={f.icon} size={22} tone="accent" />
              <View style={s.col}>
                <Text variant="body" weight="bold">{t(f.title)}</Text>
                <Text variant="small" tone="gray">{t(f.sub)}</Text>
              </View>
              <Icon name="chevron-right" size={18} tone="gray" />
            </Card>
          ))}
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  col: { flex: 1, gap: 4 },
});
