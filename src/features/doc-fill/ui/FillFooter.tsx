import { StyleSheet, View } from "react-native";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { first: boolean; review: boolean; canGenerate: boolean; busy: boolean; onBack: () => void; onNext: () => void; onGenerate: () => void };

// Back / Next between sections; on the review step Next becomes "Create document".
export function FillFooter({ first, review, canGenerate, busy, onBack, onNext, onGenerate }: Props) {
  const { t } = useT();
  return (
    <View style={s.row}>
      {first ? null : <Button title={t("common.back")} icon="chevron-left" variant="line" onPress={onBack} disabled={busy} style={s.back} />}
      {review ? (
        <Button title={t("dc2.generate")} icon="file-text" variant="gradient" onPress={onGenerate} loading={busy} disabled={!canGenerate} style={s.main} />
      ) : (
        <Button title={t("common.continue")} icon="arrow-right" iconRight variant="gradient" onPress={onNext} style={s.main} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  back: { flex: 1 },
  main: { flex: 2 },
});
