export * from "./model/types";
export { usePackages, usePromoStatus, useAnalytics, useUploadBanner, useCheckout, promotionKeys } from "./model/queries";
export { usePromotionLive } from "./model/useLive";
export { usePending } from "./model/usePending";

export { rangeError, type RangeError } from "./lib/range";
export { placementState, type PlacementState } from "./lib/placementState";
export { popularId, chosenPackage } from "./lib/packages";
export { promotionErrorCode, isRetryable, type PromotionErrorCode } from "./lib/errors";
export { bannerBlock, isBannerUrl, BANNER_MAX_MB, type BannerBlock } from "./lib/banner";
export { sparkBars } from "./lib/spark";
export { PlacementArt } from "./ui/PlacementArt";
export { fitPicture, PORTRAIT_RATIO } from "./lib/fit";
export { PERIODS, periodRange, matchPeriod, spanDays } from "./lib/presets";
export { progressOf } from "./lib/progress";
export { isRunning } from "./lib/settle";
export { activeSince, promoPeriod } from "./lib/period";
