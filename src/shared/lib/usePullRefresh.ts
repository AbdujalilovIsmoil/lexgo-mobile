import { useState } from "react";

/**
 * Pull to refresh that spins only while the person's own pull is being answered. Binding the spinner to a query's `isRefetching` made it
 * show (and push the list down on iOS) at every background refetch — on opening a page, on returning to the app, at every poll.
 */
export function usePullRefresh(refetch: () => unknown) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    void Promise.resolve(refetch()).finally(() => setRefreshing(false));
  };
  return { refreshing, onRefresh };
}
