// How many times the tablet's docked sidebar (TabletFrame) has opened or closed. The page's width changes with it; a grid that sees this
// count move between two of its measurements keeps its columns, so its cards only get wider or narrower (see useGrid).
let count = 0;

export const dockChanged = (): void => {
  count += 1;
};

export const dockCount = (): number => count;
