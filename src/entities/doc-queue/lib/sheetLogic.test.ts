import { actionOf, filesOf, filterChips, mainFile, factsOf, tabCounts } from "./sheetLogic";
import type { DocFile, DocReq } from "../model/types";

const file = (id: string): DocFile => ({ id, name: `${id}.pdf`, mime: "application/pdf", size: 10, path: `/f/${id}`, note: "", kind: "file" });
const doc = (p: Partial<DocReq>): DocReq => ({ id: "1", status: "claimed", files: [], templateFile: null, finalFile: null, clientName: "", requestedType: "", serviceName: "", assignedName: "", language: "", createdAt: "2026-10-01T10:00:00Z", updatedAt: "", ...p }) as unknown as DocReq;
const can = (p: object) => ({ claim: false, editor: false, transfer: false, ...p }) as never;

describe("files", () => {
  it("orders final, client, template and picks the first as main", () => {
    const d = doc({ finalFile: file("fin"), files: [file("a"), file("b")], templateFile: file("tpl") });
    expect(filesOf(d).map((e) => e.file.id)).toEqual(["fin", "a", "b", "tpl"]);
    expect(mainFile(d)?.role).toBe("final");
    expect(mainFile(doc({ files: [file("a")] }))?.file.id).toBe("a");
    expect(mainFile(doc({}))).toBeNull();
  });
  it("skips files without a path", () => {
    expect(filesOf(doc({ files: [{ ...file("x"), path: "" }] }))).toEqual([]);
  });
});

describe("actionOf", () => {
  it("claim > editor > transfer", () => {
    expect(actionOf(can({ claim: true, editor: true }))).toBe("claim");
    expect(actionOf(can({ editor: true, transfer: true }))).toBe("editor");
    expect(actionOf(can({ transfer: true }))).toBe("transfer");
    expect(actionOf(can({}))).toBeNull();
  });
});

describe("factsOf", () => {
  it("keeps only known facts and flags a late wait", () => {
    const now = Date.parse("2026-10-03T10:00:00Z");
    const f = factsOf(doc({ clientName: "Ali", files: [file("a")] }), now);
    expect(f.map((x) => x.key)).toEqual(["client", "created", "waiting", "files"]);
    expect(f.find((x) => x.key === "waiting")?.late).toBe(true);
    expect(factsOf(doc({ status: "completed" }), now).some((x) => x.key === "waiting")).toBe(false);
  });
});

describe("tabs and chips", () => {
  it("counts by status", () => {
    expect(tabCounts([doc({ status: "new" }), doc({ status: "new" }), doc({ status: "completed" })])).toEqual({ all: 3, new: 2, completed: 1 });
  });
  it("lists active filters only", () => {
    const names = { flow: (v: string) => `f:${v}`, oldest: "old" };
    expect(filterChips({ flow: "all", newest: true }, names)).toEqual([]);
    expect(filterChips({ flow: "custom_from_scratch", newest: false }, names)).toEqual([{ key: "flow", label: "f:custom_from_scratch" }, { key: "sort", label: "old" }]);
  });
});
