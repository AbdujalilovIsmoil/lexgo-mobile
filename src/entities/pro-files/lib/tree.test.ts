import type { Tree } from "../model/types";
import { typeCounts, usageByKind, viewOf } from "./tree";

const f = (id: string, name: string, ext: string, size: number, createdAt: string, folderId = "") => ({ id, name, ext, size, createdAt, folderId, starred: false }) as never;
const tree = { quota: {} as never, folders: [{ id: "a", name: "Zeta", parentId: "", size: 1, createdAt: "2026-01-01" } as never], files: [f("1", "b.pdf", "pdf", 5, "2026-02-01"), f("2", "a.docx", "docx", 9, "2026-03-01"), f("3", "c.png", "png", 1, "2026-01-15")] } as Tree;

it("filters by type and hides folders for a file type", () => {
  const v = viewOf(tree, "all", "", "", { type: "pdf", sort: "name" });
  expect(v.files.map((x) => x.id)).toEqual(["1"]);
  expect(v.folders).toEqual([]);
  expect(viewOf(tree, "all", "", "", { type: "folder", sort: "name" }).files).toEqual([]);
});
it("sorts by name, newest and size", () => {
  const ids = (sort: "name" | "new" | "size") => viewOf(tree, "all", "", "", { type: "all", sort }).files.map((x) => x.id);
  expect(ids("name")).toEqual(["2", "1", "3"]);
  expect(ids("new")).toEqual(["2", "1", "3"]);
  expect(ids("size")).toEqual(["2", "1", "3"]);
});
it("counts what each type holds", () => expect(typeCounts(tree, "all", "", "")).toMatchObject({ all: 4, folder: 1, pdf: 1, doc: 1, image: 1, file: 0 }));

it("sums bytes per kind, largest first", () => {
  const u = usageByKind(tree.files);
  expect(u.map((x) => x.kind)).toEqual(["doc", "pdf", "image"]);
  expect(u[0].bytes).toBe(9);
});
