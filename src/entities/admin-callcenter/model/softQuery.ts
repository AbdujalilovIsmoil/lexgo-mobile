type Q = { isError: boolean; data?: unknown };

// A background refetch that fails must not replace a list that is already on screen with an error.
export function soft<T extends Q>(q: T): T {
  return q.data !== undefined && q.isError ? { ...q, isError: false } : q;
}
