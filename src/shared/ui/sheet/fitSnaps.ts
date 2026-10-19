// Snap heights (px, ascending) for a sheet whose content is `fit` px tall: short content gets a
// sheet that hugs it (a single snap), long content keeps the requested snaps with the top one
// capped to what the content needs. `fit` unknown (null) leaves the snaps as they are.
export function fitSnaps(snaps: number[], fit: number | null, max: number): number[] {
  const capped = snaps.map((s) => Math.min(s, max));
  if (fit == null || fit <= 0) return capped;
  const want = Math.min(fit, capped[capped.length - 1]);
  if (want <= capped[0]) return [Math.max(want, 1)];
  return [capped[0], want];
}
