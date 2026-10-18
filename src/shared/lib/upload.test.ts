import { appendFile } from "./upload";

const mockCopy = jest.fn();
let mockFail = false;
let mockCorrupt = false;
let mockSizes: Record<string, number> = {};
jest.mock("expo-document-picker", () => ({}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-file-system", () => {
  const nm = (u: string) => decodeURIComponent(u.split("/").pop() ?? "");
  class File {
    uri: string;
    name: string;
    constructor(...a: unknown[]) {
      const parts = a.map((x) => (typeof x === "string" ? x : (x as { uri: string }).uri.replace(/\/$/, "")));
      this.uri = parts.join("/");
      this.name = nm(this.uri);
    }
    get size() { return mockSizes[this.uri] ?? 10; }
    copySync(dst: File) { if (mockFail) throw new Error("denied"); mockCopy(this.uri, dst.uri); mockSizes[dst.uri] = mockCorrupt ? 0 : (mockSizes[this.uri] ?? 10); }
  }
  class Directory {
    uri: string;
    constructor(...a: unknown[]) { this.uri = a.map((x) => (typeof x === "string" ? x : (x as { uri: string }).uri)).join("/"); }
    create() {}
  }
  return { File, Directory, Paths: { cache: { uri: "file:///cache" } } };
});

const mk = () => { const parts: [string, { uri: string }, string][] = []; return { parts, form: { append: (k: string, v: { uri: string }, n: string) => parts.push([k, v, n]) } as unknown as FormData }; };
beforeEach(() => { mockCopy.mockClear(); mockFail = false; mockCorrupt = false; mockSizes = {}; });

it("sends a plain-named file as is", () => {
  const { form, parts } = mk();
  appendFile(form, "file", { uri: "file:///cache/a.pdf", name: "a.pdf" });
  expect(mockCopy).not.toHaveBeenCalled();
  expect(parts[0][1].uri).toBe("file:///cache/a.pdf");
});
it("copies a non-plain name and sends the copy under the plain name", () => {
  const { form, parts } = mk();
  appendFile(form, "file", { uri: "file:///cache/Scan%202026.pdf", name: "Scan 2026.pdf" });
  expect(parts[0][2]).toBe("Scan_2026.pdf");
  expect(parts[0][1].uri).toMatch(/\/up-.*\/Scan_2026\.pdf$/);
});
it("puts two same-named files in different directories", () => {
  const { form, parts } = mk();
  jest.spyOn(Date, "now").mockReturnValue(5);
  appendFile(form, "files", { uri: "file:///a/x%20y.pdf", name: "x y.pdf" });
  appendFile(form, "files", { uri: "file:///b/x%20y.pdf", name: "x y.pdf" });
  expect(parts[0][1].uri).not.toBe(parts[1][1].uri);
  jest.restoreAllMocks();
});
it("falls back to the original file when the copy fails", () => {
  mockFail = true;
  const { form, parts } = mk();
  appendFile(form, "file", { uri: "content://x/y", name: "Scan 1.pdf" });
  expect(parts[0][1].uri).toBe("content://x/y");
  expect(parts[0][2]).toBe("Scan 1.pdf");
});
it("falls back when the copy size differs", () => {
  const { form, parts } = mk();
  mockSizes["file:///c/q%20r.pdf"] = 7;
  mockCorrupt = true;
  appendFile(form, "file", { uri: "file:///c/q%20r.pdf", name: "q r.pdf" });
  expect(parts[0][2]).toBe("q r.pdf");
});
