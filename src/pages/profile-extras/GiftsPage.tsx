import { useState } from "react";
import { View } from "react-native";
import { GiftRowCard, useGifts, type Gift, type GiftCreated } from "@/entities/profile-extras";
import { ClaimSheet, GiftSheet } from "@/features/profile-extras";
import { GiftActions, GiftShareSheet, type ShareView } from "@/widgets/profile-extras";
import { AdminPage, ChipBar, PagedList } from "@/shared/ui/admin";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

const viewOf = (g: Gift): ShareView => ({ title: g.title, code: g.code, shareUrl: g.shareUrl, qrUrl: g.qrUrl, status: g.status });
const freshOf = (g: GiftCreated, title: string): ShareView => ({ title, code: g.code, shareUrl: g.shareUrl, qrUrl: g.qrUrl, status: g.status, paymentId: g.paymentId, paymentUrl: g.paymentUrl, fresh: true });

// Gifts sent and received: create one, claim one by its code, open one to share its link or QR.
export function GiftsPage({ code = "" }: { code?: string }) {
  const { t } = useT();
  const q = useGifts();
  const [create, setCreate] = useState(false);
  const [claim, setClaim] = useState(!!code);
  const [view, setView] = useState<ShareView | null>(null);
  const [dir, setDir] = useState<"all" | "sent" | "received">("all");
  const all = q.data ?? [];
  const rows = dir === "all" ? all : all.filter((g) => (g.direction === "received") === (dir === "received"));
  const count = (d: string) => (d === "all" ? all.length : all.filter((g) => (g.direction === "received") === (d === "received")).length);
  const { items, query } = useSlicedList(rows, q, dir);
  return (
    <AdminPage title={t("py8.title")}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(g) => g.id}
        flat
        renderItem={(g) => <GiftRowCard item={g} onPress={() => setView(viewOf(g))} />}
        empty={{ icon: "gift", title: t("py8.empty"), text: t("py8.emptyText") }}
        header={
          <View>
            <GiftActions onGive={() => setCreate(true)} onClaim={() => setClaim(true)} />
            {all.length ? <View style={{ marginHorizontal: -16, marginBottom: 6 }}><ChipBar value={dir} onChange={setDir} options={(["all", "sent", "received"] as const).map((d) => ({ value: d, label: t(`gfx.${d}`), count: count(d) }))} /></View> : null}
          </View>
        }
      />
      <GiftSheet visible={create} onClose={() => setCreate(false)} onCreated={(g) => setView(freshOf(g, t("py8.untitled")))} />
      <ClaimSheet visible={claim} onClose={() => setClaim(false)} initial={code} />
      <GiftShareSheet view={view} onClose={() => setView(null)} />
    </AdminPage>
  );
}
