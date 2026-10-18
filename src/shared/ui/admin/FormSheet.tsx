import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ScrollView } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { SheetActions } from "../profile/SheetActions";
import { BottomSheet, SheetScroll } from "../sheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  submitting?: boolean;
  disabled?: boolean;
  danger?: boolean;
  secondary?: { label: string; onPress: () => void };
  snaps?: number[];
  guardClose?: () => boolean; // true → closing is held back (e.g. a confirm "discard changes?")
  scrollRef?: Ref<ScrollView>;
  children: ReactNode;
};

// Bottom-sheet form: scrollable fields and a sticky action bar (the keyboard lifts the whole sheet).
export function FormSheet({ visible, onClose, title, subtitle, onSubmit, submitLabel, submitting, disabled, danger, secondary, snaps = [0.7, 0.94], guardClose, scrollRef, children }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={subtitle} snaps={snaps} guardClose={guardClose}>
      <SheetScroll ref={scrollRef} contentContainerStyle={[s.body, onSubmit && s.withBar]}>{children}</SheetScroll>
      {onSubmit ? (
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          {secondary && !danger ? (
            <SheetActions cancel={secondary} submit={{ label: submitLabel ?? t("adm.save"), onPress: onSubmit, loading: submitting, disabled }} />
          ) : (
            <View style={s.pair}>
              {secondary ? <Button title={secondary.label} variant="line" onPress={secondary.onPress} style={s.half} /> : null}
              <Button title={submitLabel ?? t("adm.save")} variant={danger ? "line" : "gradient"} onPress={onSubmit} loading={submitting} disabled={disabled} style={secondary ? s.half : s.full} full={!secondary} />
            </View>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 16, gap: 14 },
  withBar: { paddingBottom: 20 }, // the action bar below already carries the safe-area gap
  bar: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
  pair: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  full: { flex: 1 },
});
