import { Fragment, type ReactElement } from "react";
import { View } from "react-native";
import { EmptyState, ErrorView, Skeleton, type IconName } from "@/shared/ui";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };
type Props<T> = { query: Q; items: T[]; keyOf: (i: T) => string; render: (i: T) => ReactElement; empty: { icon: IconName; title: string; text?: string } };

// The first rows of a counter's list inside the drawer: skeleton → error → empty → rows.
export function PreviewList<T>({ query, items, keyOf, render, empty }: Props<T>) {
  if (query.isLoading) return <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={84} round={20} />)}</View>;
  if (query.isError && !items.length) return <ErrorView error={query.error} onRetry={() => void query.refetch()} compact />;
  if (!items.length) return <EmptyState icon={empty.icon} title={empty.title} text={empty.text} compact />;
  return <View style={{ gap: 10 }}>{items.map((i) => <Fragment key={keyOf(i)}>{render(i)}</Fragment>)}</View>;
}
