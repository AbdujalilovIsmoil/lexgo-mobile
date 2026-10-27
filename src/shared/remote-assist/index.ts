// Remote assistance, the screen side (TZ.md Remote Assistance contract §9, §18, §21): the page / control registry screens fill, the
// route allowlist and the scroll helper. The session, the executor and the UI live in features/ and widgets/remote-assist.
export { useRaPage, useRaControl } from "./useRaControl";
export { useRaField } from "./useRaField";
export { useRaScroller, scrollIntoView } from "./scroller";
export { registerControl, findControl, raControls, claimPage, claimedPage, openModal, onRaChange, raTouch, blockControl } from "./registry";
export { sensitivityOf } from "./secret";
export { raTarget, raPlaceOf, type RaPlace, type RaTarget } from "./routes";
export { measureView, fullyInWindow } from "./measure";
export { RA_VIEW, RA_FIELD, RA_PICK, RA_SWITCH, RA_OPENER, RA_FINAL, raOk, raFail } from "./types";
export type { RaControl, RaControlSpec, RaDone, RaRect, RaResult, RaSensitivity, RaState } from "./types";
