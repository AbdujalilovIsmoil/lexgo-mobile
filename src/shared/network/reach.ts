// When the API last answered anything (any status). A /health probe that fails while real requests are being answered is the
// probe's own trouble, not a dead server.
let last = 0;
export const noteReached = (): void => { last = Date.now(); };
export const reachedWithin = (ms: number): boolean => Date.now() - last < ms;
