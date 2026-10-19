import { ApiError } from "./errors";

/** True when the request never got an answer (no connection, DNS, timeout) as opposed to a server that answered with an error. */
export const isOfflineError = (e: unknown): boolean => e instanceof ApiError && e.status === 0;
