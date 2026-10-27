// Time to the first byte of plain requests (uploads excluded) goes to this hook: the slow-link detector measures
// the network itself, not how long a screen takes to load several pages of data. Only requests that start while at
// most two others are in flight count: a burst of parallel calls (screen opening, a busy JS thread on a weak device
// or in dev mode) queues up and says nothing about the link.
let hook: ((ms: number) => void) | null = null;
let inflight = 0;

let reached: ((status: number) => void) | null = null;
/** Called for every HTTP response of any status (proof that the API is reachable right now), with that status. */
export const onReached = (fn: ((status: number) => void) | null): void => { reached = fn; };

export const onRoundTrip = (fn: ((ms: number) => void) | null): void => { hook = fn; };

/** Wraps one fetch: counts it as in flight and reports its time to first byte when it ran (nearly) alone. */
export async function timed(go: () => Promise<Response>, plain: boolean): Promise<Response> {
  const t0 = Date.now();
  const solo = inflight < 3;
  inflight += 1;
  try {
    const res = await go();
    reached?.(res.status);
    if (solo && plain) hook?.(Date.now() - t0);
    return res;
  } finally {
    inflight -= 1;
  }
}
