// Remote assistance for the client (TZ.md Remote Assistance contract): consent, the session runtime (socket, state publishing, the one
// command executor, acknowledgements) and the client's own controls. Drawn by widgets/remote-assist, mounted for clients by core.
export { useRaHost } from "./model/useRaHost";
export { useRaStore, hideEnded, type RaEnd, type RaBusy } from "./model/store";
export { useRaAsk, askShown, answerAsk } from "./model/ask";
export { useRaMark } from "./model/mark";
export { answerRequest, requestTimedOut } from "./model/consent";
export { raControl, type RaControlKind } from "./model/lifecycle";
export { askFor as openRaRequest } from "./model/discovery";
export type { RaAsk } from "./model/execTypes";
