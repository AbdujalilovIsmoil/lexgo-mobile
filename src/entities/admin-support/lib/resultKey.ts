// Identity of a result card: the work id / record id when the API gave one.
export const resultKey = (kind: string, ...ids: string[]) => `${kind}:${ids.find(Boolean) || Date.now()}`;
