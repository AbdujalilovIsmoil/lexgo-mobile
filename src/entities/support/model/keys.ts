// Every client-support query lives under ["support", …] so one invalidation refreshes the module.
export const supKeys = {
  all: ["support"] as const,
  lists: ["support", "list"] as const,
  list: (tab: string) => ["support", "list", tab] as const,
  unread: ["support", "unread"] as const,
  ticket: (id: string) => ["support", "ticket", id] as const,
  chat: (id: string) => ["support", "chat", id] as const,
  meta: ["support", "meta"] as const,
};
