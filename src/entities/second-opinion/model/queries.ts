import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { fetchOptions, fetchPromotion, createSecondOpinion, requestQuote } from "../api/soApi";
import { soErrorKind } from "../lib/errors";
import type { Promotion } from "./types";

export const soKeys = {
  promo: (orderId: string) => ["so-promo", orderId] as const,
  options: (orderId: string) => ["so-options", orderId] as const,
};

const HIDDEN = (orderId: string): Promotion => ({ visible: false, orderId, placement: "in_progress", title: "", description: "", benefits: [], dismissible: false, dismissedForSession: false, priceVisible: false, ctaLabel: "", optionsUrl: "", quoteUrl: "", eventUrl: "" });

// The promotion of one order. `url` is what the order carries (second_opinion_promotion_url / actions.second_opinion_promotion): when it is
// empty the promotion is not rendered and nothing is requested. A refusal (409 not available / 404) simply means "nothing to show".
export function usePromotion(orderId: string, url: string) {
  return useQuery({
    queryKey: soKeys.promo(orderId),
    enabled: !!orderId && !!url,
    staleTime: 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        return await fetchPromotion(url);
      } catch (e) {
        const kind = soErrorKind(e);
        if (kind === "not_available" || kind === "order_not_found") return HIDDEN(orderId);
        throw e;
      }
    },
  });
}

// marketplace.order_started / order_completed say "look again": the flag is a trigger, the endpoint decides. The order may not carry the
// link yet when the first event arrives, so the event's own `second_opinion_promotion_url` is returned to be used until the order has one.
// Also after a reconnect.
export function usePromotionSync(orderId: string): string {
  const qc = useQueryClient();
  const [eventUrl, setEventUrl] = useState("");
  const again = useCallback(() => {
    void qc.invalidateQueries({ queryKey: soKeys.promo(orderId) });
    void qc.invalidateQueries({ queryKey: ["market-orders"] });
  }, [qc, orderId]);
  useUserEvents(["marketplace.order_started", "marketplace.order_completed"], (e) => {
    const id = typeof e.order_id === "string" ? e.order_id : "";
    if (id && id !== orderId) return;
    const url = typeof e.second_opinion_promotion_url === "string" ? e.second_opinion_promotion_url : "";
    if (e.show_second_opinion_promotion === true && url) setEventUrl(url.split("?")[0]);
    again();
  });
  useResync(again);
  return eventUrl;
}

// The card closed for this session: hidden at once (a refetch with the same session answers visible:false as well).
export function useHidePromotion(orderId: string) {
  const qc = useQueryClient();
  return useCallback(() => qc.setQueryData<Promotion>(soKeys.promo(orderId), (p) => (p ? { ...p, visible: false, dismissedForSession: true } : p)), [qc, orderId]);
}

export const useSoOptions = (orderId: string, url: string, enabled: boolean) =>
  useQuery({ queryKey: soKeys.options(orderId), queryFn: () => fetchOptions(url), enabled: enabled && !!url, staleTime: 5 * 60 * 1000, retry: false });

export const useSoQuote = () => useMutation({ mutationFn: (v: Parameters<typeof requestQuote>) => requestQuote(...v) });
export const useSoCreate = () => useMutation({ mutationFn: (v: Parameters<typeof createSecondOpinion>) => createSecondOpinion(...v) });
