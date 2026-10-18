import { View } from "react-native";
import type { Msg } from "@/entities/secure-chat";
import { openFile } from "@/entities/secure-chat";
import { Stars } from "@/entities/rating";
import { ratingMsLeft, type ProOrder } from "@/entities/pro-order";
import { Button, Text, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useNow } from "@/shared/lib/pay/useNow";
import { mmss } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// The delivered result (text + files) and the client's rating state, read-only (TZ 10, 13, 14). The countdown
// comes from the backend deadline; the "rated" / "closed" state is the backend's answer, not the phone clock's.
export function OrderResultCard({ order: o }: { order: ProOrder }) {
  const { t } = useT();
  const r = o.rating;
  const open = r.available && !r.closed;
  const left = ratingMsLeft(r, useNow(open));
  if (!o.result.text && !o.result.files.length && !open && !r.stars && !r.closed) return null;
  const view = (f: (typeof o.result.files)[number]) => openFile({ id: f.fileId, file: { name: f.fileName, mime: "", size: 0, path: f.downloadUrl } } as Msg).catch(() => toast(t("ntd.sellerV2.ord.openFail"), "err"));
  return (
    <SectionCard title={t("ntd.sellerV2.ord.result")}>
      {o.result.text ? <Text variant="small" selectable>{o.result.text}</Text> : null}
      {o.result.files.map((f) => <Button key={f.fileId || f.fileName} title={f.fileName || f.fileId} icon="paperclip" variant="line" size="sm" onPress={() => void view(f)} />)}
      <View style={{ gap: 4 }}>
        <Text variant="caption" tone="gray">{t("ntd.sellerV2.ord.rating")}</Text>
        {r.stars ? <><Stars value={r.stars} />{r.comment ? <Text variant="small">{r.comment}</Text> : null}</> : null}
        {!r.stars && open && left > 0 ? <Text variant="small" tone="warn">{t("ntd.sellerV2.ord.ratingOpen", { time: mmss(left) })}</Text> : null}
        {!r.stars && !(open && left > 0) ? <Text variant="small" tone="gray">{t(r.closed || r.reason ? "ntd.sellerV2.ord.ratingClosed" : "ntd.sellerV2.ord.ratingNone")}</Text> : null}
      </View>
    </SectionCard>
  );
}
