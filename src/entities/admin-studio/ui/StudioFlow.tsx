import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { useStudioText } from "../model/useStudioText";
import type { StudioStatus } from "../model/types";

const FLOW: StudioStatus[] = ["draft", "submitted", "in_review", "approved", "published"];

// Where the object is on draft → submitted → in review → approved → published (approval-free: draft → published).
export function StudioFlow({ status, raw = "", approvalFree }: { status: StudioStatus; raw?: string; approvalFree?: boolean }) {
  const { t } = useT();
  const { status: label } = useStudioText();
  const c = useColors();
  const flow = approvalFree ? (["draft", "published"] as StudioStatus[]) : FLOW;
  const back = status === "changes_requested";
  const archived = status === "archived";
  const at = back ? flow.indexOf("in_review") : archived ? -1 : flow.indexOf(status);
  const note = archived ? t("admStudio.flow.archived") : back ? t(/^(rejected|declined)$/i.test(raw.trim()) ? "admStudio.flow.rejected" : "admStudio.flow.back") : approvalFree ? t("admStudio.flow.direct") : "";
  return (
    <View style={{ gap: 8 }}>
      <View style={s.row}>
        {flow.map((st, i) => {
          const done = i < at;
          const cur = i === at;
          const tint = cur ? (back ? c.warn : c.accent) : done ? c.ok : c.gray2;
          return (
            <View key={st} style={s.step}>
              <View style={[s.dot, { backgroundColor: cur || done ? tint : c.surface2, borderColor: tint }]}>
                {done ? <Icon name="check" size={13} color="#fff" /> : <Text variant="caption" weight="bold" style={{ color: cur ? "#fff" : c.gray }}>{i + 1}</Text>}
              </View>
              <Text variant="caption" tone={cur ? "ink" : "gray"} weight={cur ? "bold" : "regular"} center numberOfLines={2}>{back && cur ? label("changes_requested", raw) : label(st)}</Text>
            </View>
          );
        })}
      </View>
      {note ? <Text variant="caption" tone={back ? "warn" : "gray"}>{note}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  step: { flex: 1, alignItems: "center", gap: 4 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
