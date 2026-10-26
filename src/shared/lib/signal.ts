// A listener list that re-renders nothing: for an event a child or two want to hear about (a page scrolling) without lifting it into
// state, which would re-render the whole page on every scroll step.
export type Signal = { emit: () => void; on: (f: () => void) => () => void };

export function createSignal(): Signal {
  const fns = new Set<() => void>();
  return {
    emit: () => fns.forEach((f) => f()),
    on: (f) => {
      fns.add(f);
      return () => void fns.delete(f);
    },
  };
}
