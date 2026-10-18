import { View } from "react-native";
import { useRouter } from "expo-router";
import { isOpaqueRef, sourceRoute, useWorkRef, workRoute, type ComplaintItem } from "@/entities/rating";
import { Button, Card, Icon, Skeleton, Text } from "@/shared/ui";
import { useComplaintLabels } from "@/entities/rating";
import { useT } from "@/shared/i18n";

// "Bog'liq ish": the work a complaint is about, with a button that opens it (manual → /clients/me/works/{ref}).
export function ComplaintRelated({ c, onClose }: { c: ComplaintItem; onClose: () => void }) {
  const { t } = useT();
  const L = useComplaintLabels();
  const router = useRouter();
  const q = useWorkRef(c.kind === "manual" ? c.relatedRef : "");
  const quality = c.kind === "quality" && !!c.source;
  if (!quality && !c.relatedRef) return c.lawyerName ? <Text variant="small" tone="gray">{t("py5.f.lawyer")}: {c.lawyerName}</Text> : null;
  const w = q.data;
  const route = quality ? sourceRoute(c.source) : w?.id ? workRoute(w.type, w.workId) : "";
  const title = quality ? c.workTitle || c.subject || L.source(c.source) : w?.id ? w.title || w.workId : isOpaqueRef(c.relatedRef) ? t("pwc.row.workLinked") : t("pwc.relatedId", { id: c.relatedRef });
  return (
    <View style={{ gap: 8 }}>
      <Text variant="small" weight="bold" tone="gray">{t("pwc.related")}</Text>
      {q.isLoading && !quality ? <Skeleton height={56} round={14} /> : (
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Icon name="briefcase" size={18} tone="accent" />
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold">{title}</Text>
              {w?.workId ? <Text variant="caption" tone="gray">{w.workId}</Text> : null}
              {c.lawyerName ? <Text variant="caption" tone="gray">{t("py5.f.lawyer")}: {c.lawyerName}</Text> : null}
            </View>
          </View>
          {route ? <Button title={t("pwc.relatedOpen")} icon="arrow-right" iconRight variant="line" size="sm" onPress={() => { onClose(); router.push(route as never); }} /> : null}
        </Card>
      )}
    </View>
  );
}
