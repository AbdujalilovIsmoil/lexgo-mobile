import type { Folder, Tree, WFile } from "../model/types";
import { cardKind, type CardKind } from "./palette";

export type Section = "all" | "recent" | "starred" | "requests";
export type View = { folders: Folder[]; files: WFile[] };
export type TypeFilter = "all" | CardKind;
export type SortKey = "name" | "new" | "size";
export type Opts = { type: TypeFilter; sort: SortKey };
export const TYPES: TypeFilter[] = ["all", "folder", "pdf", "doc", "sheet", "image", "file"];
export const SORTS: SortKey[] = ["name", "new", "size"];
const PLAIN: Opts = { type: "all", sort: "name" };

// Root → current folder chain (empty at the root).
export function crumbsOf(folders: Folder[], id: string): Folder[] {
  const map = new Map(folders.map((f) => [f.id, f]));
  const out: Folder[] = [];
  for (let cur = map.get(id); cur && !out.includes(cur); cur = map.get(cur.parentId)) out.unshift(cur);
  return out;
}

// The folder and all of its descendants — a folder cannot be moved into itself or into them.
export function descendants(folders: Folder[], folderId: string): Set<string> {
  const out = new Set<string>([folderId]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const f of folders) {
      if (f.parentId && out.has(f.parentId) && !out.has(f.id)) {
        out.add(f.id);
        grew = true;
      }
    }
  }
  return out;
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

// What a section shows: the current folder's children, the 15 newest files, or everything starred.
export function viewOf(tree: Tree, section: Section, folderId: string, q: string, o: Opts = PLAIN): View {
  const needle = q.trim().toLowerCase();
  const hit = (n: string) => !needle || n.toLowerCase().includes(needle);
  let folders: Folder[] = [];
  let files: WFile[] = [];
  if (section === "all") {
    folders = tree.folders.filter((f) => f.parentId === folderId);
    files = tree.files.filter((f) => f.folderId === folderId);
  } else if (section === "starred") {
    folders = tree.folders.filter((f) => f.starred);
    files = tree.files.filter((f) => f.starred);
  } else if (section === "recent") {
    files = [...tree.files].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15);
  }
  const keep = <T extends { name: string }>(list: T[]) => list.filter((x) => hit(x.name));
  const typed = files.filter((f) => o.type === "all" || cardKind(f.ext) === o.type);
  const order = <T extends { name: string; size: number; createdAt: string }>(list: T[]) =>
    [...list].sort((a, b) => (o.sort === "size" ? b.size - a.size : o.sort === "new" ? b.createdAt.localeCompare(a.createdAt) : byName(a, b)));
  const shownFolders = o.type === "all" || o.type === "folder" ? order(keep(folders)) : [];
  return { folders: shownFolders, files: section === "recent" && o.sort === "name" && o.type === "all" ? keep(typed) : order(keep(typed)) };
}

// How many items of each type the current section holds (before the type filter), for the filter sheet.
export function typeCounts(tree: Tree, section: Section, folderId: string, q: string): Record<TypeFilter, number> {
  const v = viewOf(tree, section, folderId, q);
  const out: Record<TypeFilter, number> = { all: v.folders.length + v.files.length, folder: v.folders.length, pdf: 0, doc: 0, sheet: 0, image: 0, file: 0 };
  for (const f of v.files) out[cardKind(f.ext)] += 1;
  return out;
}

// Bytes the files take per kind (largest first, empty kinds left out) — the colours of the storage bar.
export function usageByKind(files: WFile[]): { kind: CardKind; bytes: number }[] {
  const sum = new Map<CardKind, number>();
  for (const f of files) sum.set(cardKind(f.ext), (sum.get(cardKind(f.ext)) ?? 0) + f.size);
  return [...sum].map(([kind, bytes]) => ({ kind, bytes })).filter((x) => x.bytes > 0).sort((a, b) => b.bytes - a.bytes);
}
