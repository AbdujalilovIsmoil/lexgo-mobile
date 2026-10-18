import { useSyncExternalStore } from "react";
import { useDraftStore } from "./draftStore";

const subscribe = (cb: () => void) => useDraftStore.persist.onFinishHydration(cb);
const snapshot = () => useDraftStore.persist.hasHydrated();

// The draft store loads from disk asynchronously; wait for it before restoring.
export const useDraftsReady = (): boolean => useSyncExternalStore(subscribe, snapshot, snapshot);
