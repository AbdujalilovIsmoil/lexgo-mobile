export const supKeys = {
  all: ["admin-support"] as const,
  queueAll: ["admin-support", "queue"] as const,
  queue: (tab: string) => ["admin-support", "queue", tab] as const,
  counts: ["admin-support", "counts"] as const,
  ticket: (id: string) => ["admin-support", "ticket", id] as const,
  messages: (id: string) => ["admin-support", "messages", id] as const,
  assist: (id: string) => ["admin-support", "assist", id] as const,
};

// Polling (the web also has a websocket; the app refetches while the screen is focused).
export const POLL = { queue: 10_000, counts: 30_000, ticket: 10_000, messages: 5_000, assist: 15_000 } as const;
