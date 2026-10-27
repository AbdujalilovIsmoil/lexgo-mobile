import { RA_SETTLED, type RaCommand } from "@/entities/remote-assist/model/types";

type Opts = { canRun: () => boolean; run: (c: RaCommand) => Promise<void>; answered: (id: string) => boolean };

// Commands run one at a time, oldest first, only while the session may act (active, app in front, not locked, not resyncing). An id
// is taken once: a command seen again after a reconnect — on the socket or in the history — is never run twice (TZ RA §12, §20.2).
export function createQueue(o: Opts) {
  let list: RaCommand[] = [];
  const taken = new Set<string>();
  let running = false;
  const drain = async () => {
    if (running) return;
    running = true;
    try {
      while (list.length && o.canRun()) {
        const c = list.shift() as RaCommand;
        if (taken.has(c.id)) continue;
        taken.add(c.id);
        await o.run(c).catch(() => undefined);
      }
    } finally {
      running = false;
    }
  };
  return {
    add(cmds: RaCommand[]): void {
      for (const c of cmds) {
        if (!c.id || taken.has(c.id) || o.answered(c.id) || RA_SETTLED.has(c.status) || list.some((x) => x.id === c.id)) continue;
        list.push(c);
      }
      list.sort((a, b) => a.createdAt - b.createdAt);
      void drain();
    },
    drain: (): void => void drain(),
    clear: (): void => {
      list = [];
    },
    size: (): number => list.length,
  };
}

export type Queue = ReturnType<typeof createQueue>;
