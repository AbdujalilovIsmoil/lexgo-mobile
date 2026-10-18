import type { ReactElement, ReactNode } from "react";
import { View } from "react-native";
import { ErrorView } from "../ErrorView";
import { Skeleton } from "../Skeleton";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };

// Loading skeleton → error (403 reads "no access") → content, for a single query.
export function QueryBoundary({ query, skeleton, children }: { query: Q; skeleton?: ReactElement; children: ReactNode }) {
  if (query.isLoading) return skeleton ?? <View style={{ gap: 12, padding: 16 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={84} round={20} />)}</View>;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => void query.refetch()} />;
  return <>{children}</>;
}
