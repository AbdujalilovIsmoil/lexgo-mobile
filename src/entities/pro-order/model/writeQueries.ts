import { useBizMutation } from "@/shared/lib/useBizMutation";
import { requestAdditional } from "../api/writeApi";
import { orderKeys } from "./queries";

const inv = [orderKeys.all];

export const useRequestAdditional = (onDone?: () => void) =>
  useBizMutation({ mutationFn: (v: { id: string; optionIds: string[]; note: string }) => requestAdditional(v.id, v.optionIds, v.note), invalidate: inv, success: "ntd.sellerV2.add.sent", onSuccess: onDone });
