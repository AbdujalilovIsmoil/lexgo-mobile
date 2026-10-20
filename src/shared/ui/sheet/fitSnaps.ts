// Snap heights (px, ascending) for a sheet whose content is `fit` px tall: short content gets a
// sheet that hugs it (a single snap), long content keeps the requested snaps with the top one
// capped to what the content needs. `fit` unknown (null) leaves the snaps as they are.
// `expandable` (forms) keeps the top snap reachable whatever the content: the sheet opens hugging it and can still be pulled up.
export function fitSnaps(snaps: number[], fit: number | null, max: number, expandable = false): number[] {
  const capped = snaps.map((s) => Math.min(s, max));
  if (fit == null || fit <= 0) return capped;
  const top = capped[capped.length - 1];
  if (expandable) {
    const low = Math.max(Math.min(fit, capped[0]), 1);
    return top - low >= 40 ? [low, top] : [Math.max(low, top)];
  }
  const want = Math.min(fit, top);
  if (want <= capped[0]) return [Math.max(want, 1)];
  return [capped[0], want];
}
