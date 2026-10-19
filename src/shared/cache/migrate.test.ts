import { migrate, type MigratableDb } from "./migrate";
import { DB_VERSION } from "./schema";

// A tiny fake of the SQLite calls: remembers user_version and the outbox columns, and fails like SQLite does when
// a column is added twice.
function fakeDb(start: { version: number; nextAt: boolean; outbox: boolean }) {
  const st = { ...start, executed: [] as string[] };
  const d: MigratableDb = {
    execAsync: async (sql) => {
      st.executed.push(sql.trim().split("\n")[0]);
      const v = /PRAGMA user_version = (\d+)/.exec(sql);
      if (v) st.version = Number(v[1]);
      if (/CREATE TABLE IF NOT EXISTS outbox/.test(sql)) st.outbox = true;
      if (/ADD COLUMN next_at/.test(sql)) {
        if (st.nextAt) throw new Error("duplicate column name: next_at");
        st.nextAt = true;
      }
    },
    getFirstAsync: async <T,>() => ({ user_version: st.version }) as T,
    getAllAsync: async <T,>() => (st.outbox ? [{ name: "id" }, { name: "payload" }, ...(st.nextAt ? [{ name: "next_at" }] : [])] : []) as T[],
  };
  return { d, st };
}

describe("cache database migration", () => {
  it("creates everything on a fresh install", async () => {
    const { d, st } = fakeDb({ version: 0, nextAt: false, outbox: false });
    await expect(migrate(d)).resolves.toBe(DB_VERSION);
    expect(st.nextAt).toBe(true);
    expect(st.version).toBe(DB_VERSION);
  });

  it("upgrades an existing v2 install (outbox without next_at)", async () => {
    const { d, st } = fakeDb({ version: 2, nextAt: false, outbox: true });
    await migrate(d);
    expect(st.nextAt).toBe(true);
    expect(st.version).toBe(DB_VERSION);
  });

  it("finishes a v3 upgrade that was killed after the ALTER but before user_version was written", async () => {
    const { d, st } = fakeDb({ version: 2, nextAt: true, outbox: true });
    await expect(migrate(d)).resolves.toBe(DB_VERSION);
    expect(st.executed.some((x) => /ADD COLUMN/.test(x))).toBe(false);
  });

  it("does nothing when already current, and leaves a newer database alone", async () => {
    const cur = fakeDb({ version: DB_VERSION, nextAt: true, outbox: true });
    await migrate(cur.d);
    expect(cur.st.executed).toEqual([]);
    const newer = fakeDb({ version: DB_VERSION + 1, nextAt: true, outbox: true });
    await expect(migrate(newer.d)).resolves.toBe(DB_VERSION + 1);
    expect(newer.st.version).toBe(DB_VERSION + 1);
  });
});
