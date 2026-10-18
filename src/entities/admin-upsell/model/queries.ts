import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createOffer, listOffers } from "../api/offerApi";
import type { OfferInput } from "./types";

export const offerKeys = { all: ["admin-upsell"] as const };
export const useOffers = () => useQuery({ queryKey: [...offerKeys.all, "list"], queryFn: listOffers });
export const useCreateOffer = () => useAdminMutation({ mutationFn: (i: OfferInput) => createOffer(i), invalidate: [offerKeys.all], success: "ag6.offer.created" });
