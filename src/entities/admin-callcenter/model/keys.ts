// Query-key prefixes of the call-center console; "admin-cc" refreshes the whole module.
export const ccKeys = {
  all: ["admin-cc"] as const,
  queue: ["admin-cc", "queue"] as const,
  urgent: ["admin-cc", "urgent"] as const,
  complaints: ["admin-cc", "complaints"] as const,
  board: ["admin-cc", "board"] as const,
  clients: ["admin-cc", "clients"] as const,
  calls: ["admin-cc", "calls"] as const,
};

export const LIVE_MS = 12_000; // urgent board / detail poll (the web uses a websocket)
export const QUEUE_MS = 60_000; // order queue refresh, as on the web
