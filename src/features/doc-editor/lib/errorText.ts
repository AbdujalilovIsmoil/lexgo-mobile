import { ApiError } from "@/shared/api";

// The server's own sentence when there is one; picker errors and anything else get `fallback`.
export const serverText = (e: unknown, fallback: string): string => (e instanceof ApiError && e.detail ? e.detail : fallback);
