import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { askAssistant, CASE_TOOLS, MIN_CASE_CHARS, type CaseTool } from "@/entities/case-assistant";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Input, MarkdownText, PressableScale, Skeleton, Text, toast, type IconName } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";

const ICON: Record<CaseTool, IconName> = { summarize: "align-left", chronology: "clock", compare: "columns", contradictions: "alert-triangle", missing: "file-minus", deadlines: "calendar", questions: "help-circle", draft: "edit-3" };
type Result = { id: number; tool: CaseTool | "free"; text: string };

// /pro/assistant — the web's "Sun'iy intellekt yordamchi" for an advokat / yurist: paste the case, pick one of eight tools (or ask a free
// question) and read the answer; answers stack newest first and can be copied. One request at a time.
export default function ProAssistantPage() {
  const { t } = useT();
  const c = useColors();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<CaseTool | "free" | "">("");
  const [results, setResults] = useState<Result[]>([]);
  const seq = useRef(0);
  const ready = text.trim().length >= MIN_CASE_CHARS;
  const run = async (tool: CaseTool | "free") => {
    if (busy || !ready) return;
    setBusy(tool);
    const body = text.trim();
    try {
      const answer = tool === "free" ? await askAssistant(body) : await askAssistant(t(`pas.inst.${tool}`), body);
      setResults((r) => [{ id: ++seq.current, tool, text: answer || t("pas.failed") }, ...r]);
    } catch {
      toast(t("pas.failed"), "err");
    } finally {
      setBusy("");
    }
  };
  const copy = (s: string) => void Clipboard.setStringAsync(s).then(() => toast(t("pas.copied"), "ok"));
  return (
    <AdminPage title={t("pas.title")} subtitle={t("pas.subtitle")}>
      <PageScroll>
        <Card style={s.card}>
          <Input label={t("pas.caseLabel")} value={text} onChangeText={setText} placeholder={t("pas.casePh")} multiline maxLength={20000} style={s.area} textAlignVertical="top" />
          <Text variant="caption" tone={ready ? "gray2" : "warn"}>{ready ? t("pas.chars", { n: text.trim().length }) : t("pas.needText")}</Text>
          <Text variant="small" weight="bold">{t("pas.tools")}</Text>
          <View style={s.grid}>
            {CASE_TOOLS.map((k) => {
              const on = busy === k;
              return (
                <PressableScale key={k} disabled={!ready || !!busy} onPress={() => void run(k)} accessibilityRole="button" accessibilityLabel={t(`pas.full.${k}`)} style={[s.tool, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line, opacity: !ready || (busy && !on) ? 0.5 : 1 }]}>
                  <Icon name={ICON[k]} size={16} color={on ? c.accent : c.gray} />
                  <Text variant="small" weight="semibold" numberOfLines={1} style={s.flex}>{t(`pas.short.${k}`)}</Text>
                </PressableScale>
              );
            })}
          </View>
          <Button title={busy === "free" ? t("pas.thinking") : t("pas.run")} icon="send" variant="gradient" full loading={busy === "free"} disabled={!ready || !!busy} onPress={() => void run("free")} />
          <Text variant="caption" tone="gray">{t("pas.disclaimer")}</Text>
          <Text variant="caption" tone="gray2">{t("pas.piiNote")}</Text>
        </Card>
        {busy ? (
          <Card style={s.card}>
            <Text variant="small" weight="bold" tone="accent">{busy === "free" ? t("pas.answer") : t(`pas.full.${busy}`)} · {t("pas.thinking")}</Text>
            <Skeleton height={14} round={7} />
            <Skeleton height={14} round={7} />
            <Skeleton height={14} round={7} />
          </Card>
        ) : null}
        {results.map((r) => (
          <Card key={r.id} style={s.card}>
            <View style={s.head}>
              <Text variant="small" weight="bold" tone="accent" style={s.flex} numberOfLines={1}>{r.tool === "free" ? t("pas.answer") : t(`pas.full.${r.tool}`)}</Text>
              <Button title={t("pas.copy")} icon="copy" size="sm" variant="soft" onPress={() => copy(r.text)} />
            </View>
            <MarkdownText text={r.text} color={c.ink} linkColor={c.accent} mutedColor={c.gray} />
          </Card>
        ))}
        {results.length ? <Button title={t("pas.clear")} icon="trash-2" variant="ghost" onPress={() => setResults([])} style={{ alignSelf: "center" }} /> : null}
      </PageScroll>
    </AdminPage>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  area: { minHeight: 140 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tool: { width: "48%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  flex: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
});
