import { View } from "react-native";
import type { RegDetail } from "@/entities/admin-reg";
import { StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";

// The verification checklist (one line per check) and the last 12 activity entries of the applicant.
export function ActivityCard({ d }: { d: RegDetail }) {
  const { t, locale } = useT();
  const c = useColors();
  const uz = locale === "uz";
  return (
    <>
      {d.items.length ? (
        <Block title={t("admRegB.items")}>
          {d.items.map((i, n) => (
            <View key={`${i.key}-${n}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text variant="small" weight="bold" style={{ flex: 1 }}>{humanizeSlug(i.label || i.key)}{i.note ? ` · ${i.note}` : ""}</Text>
              <StatusPill status={i.status} />
            </View>
          ))}
        </Block>
      ) : null}
      <Block title={t("admRegB.activity")}>
        {d.activity.length ? d.activity.slice(0, 12).map((a) => (
          <View key={a.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.line, gap: 2 }}>
            <Text variant="small" weight="bold">{(uz && a.titleUz) || humanizeSlug(a.action)}</Text>
            {(uz && a.descriptionUz) || a.detail ? <Text variant="caption" tone="gray" numberOfLines={3}>{(uz && a.descriptionUz) || a.detail}</Text> : null}
            <Text variant="caption" tone="gray2">{fmtDateTime(a.createdAt, locale)}</Text>
          </View>
        )) : <Text variant="small" tone="gray">{t("admRegB.noActivity")}</Text>}
      </Block>
    </>
  );
}
