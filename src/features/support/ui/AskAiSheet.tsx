import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheet, Button, Icon, Input, PressableScale, SheetScroll, toast } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useSupportAi } from "../model/useSupportAi";
import { AiTurnView } from "./AiTurnView";

type Props = { visible: boolean; onClose: () => void; onHandoff: () => void };

// Step 1 of support (TZ 10): the AI answers first; "Hal bo'ldi" ends it, otherwise the user moves on to an operator.
export function AskAiSheet({ visible, onClose, onHandoff }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const ai = useSupportAi();
  const [text, setText] = useState("");
  const can = text.trim().length > 0 && !ai.busy;
  const send = () => {
    if (!can) return;
    ai.ask(text);
    setText("");
  };
  const solved = () => {
    ai.clear();
    toast(t("sp5.solvedToast"), "ok");
    onClose();
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("sp5.title")} subtitle={t("sp5.subtitle")} snaps={[0.78, 0.94]}>
      <SheetScroll contentContainerStyle={s.body}>
        {ai.turns.map((turn) => (
          <AiTurnView key={turn.id} turn={turn} onRetry={() => ai.retry(turn)} onOpen={(path) => { onClose(); router.push(path as never); }} />
        ))}
      </SheetScroll>
      <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
        <View style={s.row}>
          <View style={s.fill}><Input value={text} onChangeText={setText} placeholder={t("sp5.followUp")} returnKeyType="send" onSubmitEditing={send} maxLength={1000} /></View>
          <PressableScale onPress={send} disabled={!can} accessibilityLabel={t("sp5.ask")} style={[s.send, { backgroundColor: can ? brand.b600 : c.surface2 }]}>
            <Icon name="arrow-up" size={22} color={can ? "#FFFFFF" : c.gray2} />
          </PressableScale>
        </View>
        <View style={s.row}>
          <Button title={t("sp5.solved")} variant="line" icon="check" onPress={solved} style={s.fill} />
          <Button title={t("sp5.operator")} variant="gradient" icon="headphones" onPress={onHandoff} style={s.fill} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 4, gap: 16 },
  bar: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
});
