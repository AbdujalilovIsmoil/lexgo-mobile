export type UploadQueue = {
  /** Adds an upload at the end of the line (an id already waiting is not added twice). */
  push: (id: string, task: () => Promise<unknown>) => void;
  /** Takes a waiting upload out of the line; false when it is not waiting (already running, or done). */
  drop: (id: string) => boolean;
  /** Nothing running and nothing waiting: a new upload starts at once. */
  idle: () => boolean;
};

// Chat uploads go one at a time, in the order they were sent: the backend takes exactly one file per request and makes each file its
// own message. The next one starts when the one before it has finished, failed or been cancelled; one dropped before its turn never
// runs. `gate` can hold the next start back (the room waits while the app is in the background, where an upload would fail).
export function uploadQueue(gate: () => Promise<void> = () => Promise.resolve()): UploadQueue {
  const line: { id: string; task: () => Promise<unknown> }[] = [];
  let busy = false;
  const next = () => {
    if (busy || !line.length) return;
    busy = true;
    gate()
      .then(() => line.shift()?.task())
      .catch(() => undefined) // a task reports its own failure; the line goes on
      .finally(() => {
        busy = false;
        next();
      });
  };
  return {
    push: (id, task) => {
      if (!line.some((j) => j.id === id)) line.push({ id, task });
      next();
    },
    drop: (id) => {
      const i = line.findIndex((j) => j.id === id);
      if (i >= 0) line.splice(i, 1);
      return i >= 0;
    },
    idle: () => !busy && !line.length,
  };
}
