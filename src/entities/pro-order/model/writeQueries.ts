import { useBizMutation } from "@/shared/lib/useBizMutation";
import { completeOrder, requestAdditional } from "../api/writeApi";
import type { ResultFile } from "./extraTypes";
import { orderKeys } from "./queries";

const inv = [orderKeys.all];

export const useCompleteOrder = (onDone?: () => void) =>
  useBizMutation({ mutationFn: (v: { id: string; text: string; files: ResultFile[] }) => completeOrder(v.id, v.text, v.files), invalidate: inv, success: "ntd.sellerV2.done.sent", onSuccess: onDone });

export const useRequestAdditional = (onDone?: () => void) =>
  useBizMutation({ mutationFn: (v: { id: string; optionIds: string[]; note: string }) => requestAdditional(v.id, v.optionIds, v.note), invalidate: inv, success: "ntd.sellerV2.add.sent", onSuccess: onDone });
