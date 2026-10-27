// When the API last answered (below 500: a 502 / 503 / 504 from the gateway is the server in trouble, not an answer). A /health probe
// that fails while real requests are being answered is the probe's own trouble, not a dead server.
let last = 0;
export const noteReached = (status = 200): void => {
  if (status < 500) last = Date.now();
};
export const reachedWithin = (ms: number): boolean => Date.now() - last < ms;
