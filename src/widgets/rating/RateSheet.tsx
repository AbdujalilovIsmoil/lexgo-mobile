import { StyleSheet, View } from "react-native";
import type { RateTarget } from "@/entities/rating";
import { RateForm, useSubmitRating } from "@/features/rating";
import { Avatar, BottomSheet, SheetScroll, Text, toast } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { useT } from "@/shared/i18n";

// Rating in a bottom sheet, for a work in its 15-minute window or a finished job awaiting its review: who is being rated,
// the stars, a comment (and the complaint text at 1–2 stars). Sent → thanks toast and the sheet closes.
export function RateSheet({ target, onClose }: { target: RateTarget | null; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(target);
  const tg = target ?? kept;
  const submit = useSubmitRating(tg ?? undefined, () => { toast(t("pwr.rv.thanks"), "ok"); onClose(); });
  return (
    <BottomSheet visible={!!target} onClose={onClose} title={t("py10.rate.title")} snaps={[0.72, 0.94]}>
      <SheetScroll>
        {tg ? (
          <View style={s.col}>
            <View style={s.who}>
              <Avatar name={tg.lawyerName || "?"} size={52} />
              <View style={s.flex}>
                <Text variant="caption" tone="gray">{t("rtx.who")}</Text>
                <Text variant="h4" numberOfLines={1}>{tg.lawyerName || t("rtx.noName")}</Text>
                {tg.title ? <Text variant="small" tone="gray" numberOfLines={1}>{tg.title}</Text> : null}
              </View>
            </View>
            {target ? <RateForm bare key={target.workId} target={target} busy={submit.isPending} onExpired={onClose} onSubmit={(n, comment, text) => submit.mutate({ stars: n, comment, complaint: text })} /> : null}
          </View>
        ) : null}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ col: { gap: 18 }, who: { flexDirection: "row", alignItems: "center", gap: 12 }, flex: { flex: 1 } });
