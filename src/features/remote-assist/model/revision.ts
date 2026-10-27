// ui_revision of one session (TZ RA §9, §12): strictly increasing, and never at or below what the server already holds. `page` is the
// revision at which the current page context (page, route, open sheet) began — a command aimed at an older context is a revision
// conflict (§20.3), while a newer state of the same page (a field filled) does not invalidate it.
export function createRevision() {
  let rev = 0;
  let page = 0;
  let context = "";
  return {
    next(server: number, ctx: string): number {
      rev = Math.max(rev, server) + 1;
      if (ctx !== context) {
        context = ctx;
        page = rev;
      }
      return rev;
    },
    /** remote_assist_ui_revision_stale: jump clear of whatever the server saw. */
    skip(n = 5): void {
      rev += n;
    },
    current: (): number => rev,
    page: (): number => page,
  };
}

export type Revision = ReturnType<typeof createRevision>;
