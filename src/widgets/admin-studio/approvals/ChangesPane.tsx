import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import type { StudioDetail } from "@/entities/admin-studio";
import { versionDiff, type Change } from "./queueCore";

const SHOWN = 6;
const text = (v: unknown, empty: string): string => {
  if (v === undefined || v === null || v === "") return empty;
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 180 ? `${s.slice(0, 180)}…` : s;
};

// "What changed": the current version against the version live on the site (or the previous one), field by field — Before / Now, with
// added and removed values marked. A new record says it is not on the site yet.
export function ChangesPane({ d }: { d: StudioDetail }) {
  const { t } = useT();
  const c = useColors();
  const [all, setAll] = useState(false);
  const diff = versionDiff(d);
  const lead = diff.base === "live" ? t("admStudioD.appr.vsLive") : diff.base === "previous" ? t("admStudioD.appr.vsPrev") : d.status === "published" ? "" : t("admStudioD.appr.changesNew");
  const list = all ? diff.changes : diff.changes.slice(0, SHOWN);
  const tone = (k: Change["kind"]) => (k === "added" ? c.ok : k === "removed" ? c.err : c.warn);
  if (diff.base === "none") return <Text variant="small" tone="gray">{d.versions.length > 1 ? t("admStudioD.appr.changesNone") : t("admStudioD.appr.changesFirst")}</Text>;
  return (
    <View style={{ gap: 10 }}>
      {lead ? <Text variant="caption" tone="gray">{lead}</Text> : null}
      {!diff.changes.length ? <Text variant="small" tone="gray">{t("admStudioD.appr.changesNone")}</Text> : null}
      {list.map((ch) => (
        <View key={ch.key} style={{ gap: 4, padding: 12, borderRadius: 14, backgroundColor: c.surface2, borderLeftWidth: 4, borderLeftColor: tone(ch.kind) }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <Text variant="small" weight="bold" numberOfLines={1} style={{ flex: 1 }}>{humanizeSlug(ch.key)}</Text>
            {ch.kind !== "changed" ? <Text variant="caption" weight="bold" style={{ color: tone(ch.kind) }}>{t(`admStudioD.appr.${ch.kind}`)}</Text> : null}
          </View>
          {ch.kind !== "added" ? <Text variant="caption" tone="gray">{t("admStudioD.appr.before")}: {text(ch.before, t("admStudioD.appr.empty"))}</Text> : null}
          {ch.kind !== "removed" ? <Text variant="caption">{t("admStudioD.appr.after")}: {text(ch.after, t("admStudioD.appr.empty"))}</Text> : null}
        </View>
      ))}
      {diff.changes.length > SHOWN ? <Button title={all ? t("admStudioD.appr.collapse") : `${t("admStudioD.appr.showAll")} · ${t("admStudioD.appr.more", { n: diff.changes.length - SHOWN })}`} variant="soft" size="sm" onPress={() => setAll((v) => !v)} style={{ alignSelf: "flex-start" }} /> : null}
    </View>
  );
}
