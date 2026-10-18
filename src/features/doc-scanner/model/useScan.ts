import { useCallback, useEffect, useRef, useState } from "react";
import { File, Paths } from "expo-file-system";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import type { ScanFilter } from "@/shared/lib/scan/filters";
import { pickPages } from "./pickPages";
import { renderPage } from "./render";
import type { ScanPage } from "./types";

const dropFile = (uri: string) => {
  try {
    new File(uri).delete();
  } catch {
    /* already gone */
  }
};

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const out = [...list];
  out.splice(to, 0, out.splice(from, 1)[0]);
  return out;
};

// The scan in progress: pages (add from camera / gallery, rotate, move, remove), one look for all pages, and a small preview image
// per page that is re-rendered whenever the page or the look changes.
export function useScan() {
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [current, setCurrent] = useState(0);
  const [filter, setFilter] = useState<ScanFilter>("document");
  const [denied, setDenied] = useState(false);
  const count = useRef(0);
  useEffect(() => {
    count.current = pages.length;
  }, [pages.length]);
  const shown = useRef(new Map<string, string>()); // page id → preview file on disk (so stale ones can be deleted)
  const { t } = useT();

  const add = useCallback(async (src: "camera" | "gallery") => {
    setDenied(false); // a retry starts clean (the permission may have been granted meanwhile)
    let got: Awaited<ReturnType<typeof pickPages>>;
    try {
      got = await pickPages(src);
    } catch {
      return toast(t(src === "camera" ? "scn.camFail" : "scn.failed"), "err"); // e.g. no camera (simulator) or it is in use
    }
    if (got === "denied") return setDenied(true);
    if (!got || !got.length) return;
    setDenied(false);
    setCurrent(count.current + got.length - 1);
    setPages((p) => [...p, ...got]);
  }, [t]);

  // Preview of every page whose image is out of date (new page, rotation or look changed), rendered one at a time.
  const key = pages.map((p) => `${p.id}:${p.turns}`).join("|") + filter;
  useEffect(() => {
    let live = true;
    const ids = new Set(pages.map((p) => p.id));
    shown.current.forEach((uri, id) => {
      if (ids.has(id)) return;
      dropFile(uri); // the page was deleted
      shown.current.delete(id);
    });
    const todo = pages.filter((p) => !p.preview.endsWith(`-${p.turns}-${filter}.jpg`));
    (async () => {
      for (const p of todo) {
        if (!live) return;
        try {
          const r = await renderPage(p, filter, { maxSide: 1100, quality: 72 });
          if (!live) return;
          const f = new File(Paths.cache, `scan-${p.id}-${p.turns}-${filter}.jpg`);
          f.create({ overwrite: true });
          f.write(r.bytes);
          const old = shown.current.get(p.id);
          if (old && old !== f.uri) dropFile(old);
          shown.current.set(p.id, f.uri);
          setPages((all) => all.map((x) => (x.id === p.id && x.turns === p.turns ? { ...x, preview: f.uri } : x)));
        } catch {
          /* the original stays visible */
        }
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => shown.current.forEach(dropFile), []); // leaving the scanner: no previews left in the cache

  const last = Math.max(0, pages.length - 1);
  const rotate = (i: number) => setPages((p) => p.map((x, j) => (j === i ? { ...x, turns: (x.turns + 1) % 4 } : x)));
  const remove = (i: number) => {
    setPages((p) => p.filter((_, j) => j !== i));
    setCurrent((c) => Math.max(0, Math.min(i < c ? c - 1 : c, count.current - 2)));
  };
  const shift = (i: number, by: number) => {
    if (i + by < 0 || i + by >= count.current) return;
    setPages((p) => move(p, i, i + by));
    setCurrent(i + by);
  };
  return { pages, current: Math.min(current, last), setCurrent, filter, setFilter, add, rotate, remove, shift, denied };
}
