import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { BottomSheet, Button, Chip, Icon, IconButton, Input, Segmented, SheetScroll, Skeleton, Text, toast } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { MarketOrder } from "@/entities/order";
import { detailHref } from "@/entities/urgent/model/hrefs";
import {
  addDirection, canQuote, clampCount, soErrorKind, soKeys, toggleDirection, trackPromo, useHidePromotion, useSoCreate, useSoOptions, useSoQuote,
  type Promotion, type SoChannel, type SoErrorKind, type SoQuote,
} from "@/entities/second-opinion";

type Props = { visible: boolean; onClose: () => void; order: MarketOrder; promo: Promotion };

// The selection step of the group second opinion: one channel, the lawyer count, optional directions. Nothing here shows a price. Only
// "See the price" asks the backend for a quote; changing anything discards it. With a quote on screen the client may add a note and send
// the request (the quote's `request_payload` goes unchanged to `request_url`).
export function SecondOpinionSheet({ visible, onClose, order, promo }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const hide = useHidePromotion(order.id);
  const opts = useSoOptions(order.id, promo.optionsUrl, visible);
  const quoteM = useSoQuote();
  const createM = useSoCreate();
  const o = opts.data;
  const [channel, setChannel] = useState<SoChannel | "">("");
  const [picked, setCount] = useState(0);
  const [dirs, setDirs] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [need, setNeed] = useState("");
  const [quote, setQuote] = useState<SoQuote | null>(null);
  const [error, setError] = useState<SoErrorKind | "">("");

  const count = picked || o?.defaultCount || 0; // the backend's default until the client picks
  // Selection started: the options are on screen (once per order, placement and session).
  useEffect(() => { if (visible && o) void trackPromo(promo, "selection_started"); }, [visible, o, promo]);

  const sel = { channel, count, directions: dirs };
  const ready = !!o && canQuote(sel, o);
  const dropQuote = () => { setQuote(null); setError(""); quoteM.reset(); };
  const pick = <T,>(set: (v: T) => void) => (v: T) => { set(v); dropQuote(); };

  const fail = (e: unknown) => {
    const kind = soErrorKind(e);
    if (kind === "unauthorized") { onClose(); router.push("/auth/login"); return; }
    if (kind === "not_available" || kind === "order_not_found") {
      hide(); // the card goes; the order is read again
      void qc.invalidateQueries({ queryKey: ["market-orders"] });
      onClose();
      toast(t(kind === "not_available" ? "so1.errNotAvailable" : "so1.errNotFound"), "err");
      return;
    }
    if (kind === "placement_mismatch") void qc.invalidateQueries({ queryKey: soKeys.promo(order.id) });
    setError(kind);
  };

  const seePrice = () => {
    if (!o || !ready || !channel) return;
    setError("");
    quoteM.mutate([promo.quoteUrl || o.quoteUrl, { orderId: order.id, channel, count, directions: dirs }], {
      onSuccess: (q) => {
        // A price is shown only when the backend says the selection is complete and the price may be seen.
        if (!q.selectionComplete || !q.priceVisible) return;
        setQuote(q);
        void trackPromo(promo, "quote_viewed");
      },
      onError: fail,
    });
  };

  const send = () => {
    if (!quote || error === "previous_service_required") return;
    createM.mutate([quote.requestUrl, quote.requestPayload, need], {
      onSuccess: (r) => {
        void trackPromo(promo, "request_created");
        void qc.invalidateQueries({ queryKey: ["market-orders"] });
        void qc.invalidateQueries({ queryKey: ["urgent"] });
        toast(t("so1.sent"), "ok");
        onClose();
        if (r.id) router.push(detailHref("client", r.id));
      },
      onError: fail,
    });
  };

  const errText = error ? t(`so1.err${{ unauthorized: "Other", order_not_found: "NotFound", not_available: "NotAvailable", placement_mismatch: "Other", channel_required: "Channel", count_invalid: "Count", previous_service_required: "Previous", network: "Network", other: "Other" }[error]}`, { min: o?.minCount ?? 2, max: o?.maxCount ?? 7 }) : "";
  const suggestions = useMemo(() => (o?.directionSuggestions ?? []).filter((x) => !dirs.some((d) => d.toLowerCase() === x.toLowerCase())), [o, dirs]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("so1.sheetTitle")} snaps={[0.8, 0.94]} expandable>
      <SheetScroll>
        {opts.isLoading ? (
          <View style={s.gap}><Skeleton height={44} round={14} /><Skeleton height={56} round={14} /><Skeleton height={90} round={14} /></View>
        ) : opts.isError || !o ? (
          <View style={s.gap}>
            <Text variant="small" tone="gray">{t("so1.loadFailed")}</Text>
            <Button title={t("so1.retry")} variant="soft" onPress={() => void opts.refetch()} />
          </View>
        ) : (
          <>
            <View style={s.group}>
              <Text variant="small" weight="bold">{t("so1.channel")}</Text>
              <Segmented options={o.channels.map((x) => ({ value: x.value, label: x.label }))} value={channel as SoChannel} onChange={pick(setChannel)} />
            </View>
            <View style={s.group}>
              <Text variant="small" weight="bold">{t("so1.count")}</Text>
              <View style={[s.stepper, { backgroundColor: c.surface2 }]}>
                <IconButton icon="minus" size={40} label={t("so1.less")} onPress={() => pick(setCount)(clampCount(count - 1, o))} />
                <View style={s.mid}>
                  <Text variant="h3">{count}</Text>
                  <Text variant="caption" tone="gray">{t("so1.countHint", { min: o.minCount, max: o.maxCount })}</Text>
                </View>
                <IconButton icon="plus" size={40} label={t("so1.more")} onPress={() => pick(setCount)(clampCount(count + 1, o))} />
              </View>
            </View>
            <View style={s.group}>
              <Text variant="small" weight="bold">{t("so1.directions")}</Text>
              <Text variant="caption" tone="gray">{t("so1.directionsHint")}</Text>
              <View style={s.chips}>
                {dirs.map((d) => <Chip key={d} label={d} active icon="x" onPress={() => pick(setDirs)(toggleDirection(dirs, d))} />)}
                {suggestions.map((d) => <Chip key={d} label={d} onPress={() => pick(setDirs)(toggleDirection(dirs, d))} />)}
              </View>
              <View style={s.add}>
                <View style={s.flex}><Input value={typed} onChangeText={setTyped} placeholder={t("so1.directionPh")} returnKeyType="done" onSubmitEditing={() => { setDirs(addDirection(dirs, typed)); setTyped(""); dropQuote(); }} /></View>
                <IconButton icon="plus" size={48} label={t("so1.addDirection")} onPress={() => { setDirs(addDirection(dirs, typed)); setTyped(""); dropQuote(); }} />
              </View>
            </View>

            {quote ? (
              <View style={[s.price, { backgroundColor: c.tint2, borderColor: c.accent }]}>
                <View style={s.row}><Icon name="check-circle" size={18} tone="accent" /><Text variant="small" weight="bold">{t("so1.priceTitle")}</Text></View>
                <Text variant="h2" tone="accent">{fmtMoney(quote.amount)} {quote.currency === "UZS" ? t("common.currency") : quote.currency}</Text>
                <Text variant="caption" tone="gray">{t("so1.priceNote")}</Text>
                <Input label={t("so1.need")} value={need} onChangeText={setNeed} placeholder={t("so1.needPh")} multiline numberOfLines={3} style={s.note} />
              </View>
            ) : null}

            {errText ? <Text variant="small" tone="err">{errText}</Text> : null}
            {quote ? (
              <Button title={t("so1.send")} icon="send" variant="gradient" full loading={createM.isPending} disabled={error === "previous_service_required"} onPress={send} />
            ) : (
              <Button title={quoteM.isPending ? t("so1.calculating") : t("so1.seePrice")} variant="gradient" full loading={quoteM.isPending} disabled={!ready} onPress={seePrice} />
            )}
            {!channel ? <Text variant="caption" tone="gray" style={s.center}>{t("so1.pickChannel")}</Text> : null}
          </>
        )}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  gap: { gap: 12 },
  group: { gap: 8 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 6, borderRadius: radius.rl },
  mid: { alignItems: "center", gap: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  add: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  price: { gap: 6, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  note: { minHeight: 70, textAlignVertical: "top" },
  center: { textAlign: "center" },
});
