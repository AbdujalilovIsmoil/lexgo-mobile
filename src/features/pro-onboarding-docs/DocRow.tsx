import { StyleSheet, View } from "react-native";
import { docStatus, type DocStatus, type OnbDoc } from "@/entities/pro-onboarding";
import { fmtDate } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, Pill, Text, type IconName, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const KIND_ICON: Record<string, IconName> = { license: "award", diploma: "book-open", qualification: "file-text" };
const TONE: Record<DocStatus, PillTone> = { uploaded: "blue", review: "warn", approved: "ok", rejected: "err" };

// One uploaded proof document: type icon, name, kind · date, a status pill, the reject reason and a replace action.
export function DocRow({ doc, onReplace }: { doc: OnbDoc; onReplace?: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const st = docStatus(doc.status);
  const kind = t(`sl3.docs.kind.${doc.kind}`);
  const kindLabel = kind.startsWith("sl3.") ? doc.kind : kind;
  const name = doc.name || doc.workId;
  const sub = [kindLabel, fmtDate(doc.createdAt, locale)].filter(Boolean).join(" · ");
  const color = { uploaded: c.accent, review: c.warn, approved: c.ok, rejected: c.err }[st];
  return (
    <View style={[s.box, { backgroundColor: c.surface, borderColor: st === "rejected" ? c.err : c.line }]}>
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: c.surface2 }]}><Icon name={KIND_ICON[doc.kind] ?? "file-text"} size={18} color={color} /></View>
        <View style={s.col}>
          <Text variant="body" weight="semibold" numberOfLines={1}>{name}</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text>
        </View>
        <Pill label={t(`onbUx.docStatus.${st}`)} tone={TONE[st]} small />
      </View>
      {st === "rejected" && doc.reason ? <Text variant="small" tone="err">{t("sl2.reason", { text: doc.reason })}</Text> : null}
      {onReplace && st !== "approved" ? (
        <View style={s.actions}><Button title={t("onbUx.replace")} icon="refresh-cw" variant="soft" size="sm" onPress={onReplace} style={s.btn} /></View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: radius.r, borderWidth: 1, padding: 12, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: radius.sm + 2, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  btn: { minHeight: 44, justifyContent: "center" },
});
