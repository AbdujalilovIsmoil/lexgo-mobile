import type { StudioRef } from "@/entities/admin-studio";

// Labels of reference values seen in this session, so a picked service/category keeps its name
// even when it is outside the first page of the server list.
const seen = new Map<string, string>();

export const rememberRefs = (rows: StudioRef[] | undefined): void => rows?.forEach((r) => seen.set(r.value, r.label));
export const refLabel = (value: string): string | undefined => seen.get(value);
