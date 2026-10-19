import type { QueryClient } from "@tanstack/react-query";
import { DAY } from "./kv";
import { rulePrefixes } from "./persistRules";

/** Queries that are saved on the phone also stay in memory for a day, so a screen reopened offline still finds its data. */
export function keepPersistedQueries(client: QueryClient): void {
  for (const prefix of rulePrefixes()) client.setQueryDefaults(prefix, { gcTime: DAY });
}
